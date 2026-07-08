import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { IamApi } from "../infrastructure/iam-api.js";
import { UserAccessApi } from "../infrastructure/user-access-api.js";
import { UserAssembler } from "../infrastructure/user.assembler.js";
import { setAuthToken, setUserId, getAuthToken, getUserId, clearSession } from "../../shared/infrastructure/http.api.js";

const iamApi = new IamApi();
const userAccessApi = new UserAccessApi();

const ROLE_PERMISSIONS = {
    Administrator: ['WAREHOUSES_MANAGE', 'SENSORS_MANAGE', 'ALERTS_MANAGE', 'REPORTS_VIEW', 'BILLING_MANAGE', 'TEAM_MANAGE'],
    OperationsManager: ['WAREHOUSES_MANAGE', 'SENSORS_MANAGE', 'ALERTS_MANAGE', 'REPORTS_VIEW'],
    SecurityOperator: ['ALERTS_MANAGE', 'REPORTS_VIEW'],
    Viewer: ['REPORTS_VIEW'],
    Visitor: []
};

/**
 * IAM store
 * @summary
 * This store is used to manage the Identity and Access Management context state.
 */
export const useIamStore = defineStore('iam', () => {
    const currentUser = ref(null);
    const currentAccessProfile = ref(null);
    const errors = ref([]);
    // True while an existing session (token + user id from localStorage) is
    // being rehydrated into currentUser. Views that depend on
    // currentUser?.companyId should wait for this to be false before fetching.
    const sessionLoading = ref(false);
    const currentRole = computed(() => currentAccessProfile.value?.role ?? currentUser.value?.role ?? 'Visitor');
    const permissions = computed(() => {
        if (currentAccessProfile.value?.permissions) {
            return currentAccessProfile.value.permissions
                .split(',')
                .map(permission => permission.trim())
                .filter(Boolean);
        }

        return ROLE_PERMISSIONS[currentRole.value] ?? [];
    });
    const restrictedZoneId = computed(() => currentAccessProfile.value?.restrictedZoneId ?? null);
    const isAccessRevoked = computed(() => currentAccessProfile.value?.status === 'REVOKED');
    const isAdministrator = computed(() => currentRole.value === 'Administrator');
    const canManageWarehouses = computed(() => !isAccessRevoked.value && hasPermission('WAREHOUSES_MANAGE'));
    const canManageSensors = computed(() => !isAccessRevoked.value && hasPermission('SENSORS_MANAGE'));
    const canManageAlerts = computed(() => !isAccessRevoked.value && hasPermission('ALERTS_MANAGE'));
    const canViewReports = computed(() => !isAccessRevoked.value && hasPermission('REPORTS_VIEW'));
    const canManageTeam = computed(() => !isAccessRevoked.value && hasPermission('TEAM_MANAGE'));
    const canManageOperations = computed(() =>
        canManageWarehouses.value || canManageSensors.value
    );
    const canManageSecurity = computed(() =>
        canManageAlerts.value
    );
    const canManageBilling = computed(() => !isAccessRevoked.value && hasPermission('BILLING_MANAGE'));

    function hasPermission(permission) {
        return permissions.value.includes(permission);
    }

    /**
     * Loads the authenticated user's companyId from the backend (the
     * sign-in/sign-up response does not include it) and merges it into
     * currentUser.
     * @param {object} user
     * @returns {Promise<void>}
     */
    function loadCompanyId(user) {
        return iamApi.getUserById(user.id).then(response => {
            user.companyId = response.data.companyId;
        });
    }

    function loadAccessProfile(user) {
        currentAccessProfile.value = null;

        if (!user?.id) return Promise.resolve();

        return userAccessApi.getUserAccessProfile(user.id)
            .then(profile => {
                currentAccessProfile.value = profile;
            })
            .catch(() => {
                currentAccessProfile.value = null;
            });
    }

    function loadUserContext(user) {
        return loadCompanyId(user).then(() => loadAccessProfile(user));
    }

    /**
     * Attempt to sign in
     * @param {string} email
     * @param {string} password
     * @returns {Promise<boolean>}
     */
    function signIn(email, password) {
        errors.value = [];
        return iamApi.signIn(email, password).then(response => {
            const user = UserAssembler.toEntityFromResource(response.data);
            setAuthToken(user.token);
            setUserId(user.id);
            currentUser.value = user;
            return loadUserContext(user).then(() => true);
        }).catch(error => {
            errors.value.push(error);
            return false;
        });
    }

    /**
     * Attempt to sign up
     * @param {object} userEntity
     * @returns {Promise<boolean>}
     */
    function signUp(userEntity) {
        errors.value = [];
        const signUpResource = {
            fullName: userEntity.fullName,
            email: userEntity.email,
            password: userEntity.passwordHash,
            tradeName: userEntity.company?.tradeName ?? '',
            taxId: userEntity.company?.taxId ?? ''
        };

        return iamApi.signUp(signUpResource).then(response => {
            const user = UserAssembler.toEntityFromResource(response.data);
            setAuthToken(user.token);
            setUserId(user.id);
            currentUser.value = user;
            return loadUserContext(user).then(() => true);
        }).catch(error => {
            errors.value.push(error);
            return false;
        });
    }

    /**
     * Rehydrates currentUser from a previously persisted session
     * (token + user id in localStorage), e.g. after a page refresh.
     * Should be awaited once at app startup, before any view that reads
     * currentUser mounts. Safe to call when there is no persisted session.
     * @returns {Promise<void>}
     */
    function restoreSession() {
        const token = getAuthToken();
        const userId = getUserId();

        if (!token || !userId) {
            currentUser.value = null;
            currentAccessProfile.value = null;
            return Promise.resolve();
        }

        sessionLoading.value = true;
        return iamApi.getUserById(userId).then(response => {
            const user = UserAssembler.toEntityFromResource(response.data);
            currentUser.value = user;
            return loadAccessProfile(user);
        }).catch(error => {
            // Token expired/invalid, or user no longer exists: drop the stale session.
            clearSession();
            currentUser.value = null;
            currentAccessProfile.value = null;
            errors.value.push(error);
        }).finally(() => {
            sessionLoading.value = false;
        });
    }

    function logout() {
        clearSession();
        currentUser.value = null;
        currentAccessProfile.value = null;
        errors.value = [];
    }

    /**
     * Check if an email is registered.
     * NOTE: the backend does not expose an endpoint for this (no "lookup by
     * email" / password-recovery endpoint on AuthenticationController or
     * UsersController), so this currently always fails. See conversation
     * summary for details — needs a backend endpoint before recover-password
     * can work against the real API.
     * @param {string} email
     * @returns {Promise<boolean>}
     */
    function checkEmailExists(email) {
        errors.value = [];
        return Promise.reject(new Error("iam.recover.errors.notSupportedYet"))
            .catch(error => {
                errors.value.push(error);
                return false;
            });
    }

    return {
        currentUser,
        currentAccessProfile,
        errors,
        sessionLoading,
        currentRole,
        permissions,
        restrictedZoneId,
        isAccessRevoked,
        isAdministrator,
        canManageWarehouses,
        canManageSensors,
        canManageAlerts,
        canViewReports,
        canManageTeam,
        canManageOperations,
        canManageSecurity,
        canManageBilling,
        hasPermission,
        signIn,
        signUp,
        checkEmailExists,
        restoreSession,
        logout
    };
});
