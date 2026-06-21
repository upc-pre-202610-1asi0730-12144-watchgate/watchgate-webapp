import { defineStore } from "pinia";
import { ref } from "vue";
import { IamApi } from "../infrastructure/iam-api.js";
import { UserAssembler } from "../infrastructure/user.assembler.js";
import { setAuthToken, setUserId, getAuthToken, getUserId, clearSession } from "../../shared/infrastructure/http.api.js";

const iamApi = new IamApi();

/**
 * IAM store
 * @summary
 * This store is used to manage the Identity and Access Management context state.
 */
export const useIamStore = defineStore('iam', () => {
    const currentUser = ref(null);
    const errors = ref([]);
    // True while an existing session (token + user id from localStorage) is
    // being rehydrated into currentUser. Views that depend on
    // currentUser?.companyId should wait for this to be false before fetching.
    const sessionLoading = ref(false);

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
            return loadCompanyId(user).then(() => true);
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
            return loadCompanyId(user).then(() => true);
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
            return Promise.resolve();
        }

        sessionLoading.value = true;
        return iamApi.getUserById(userId).then(response => {
            currentUser.value = UserAssembler.toEntityFromResource(response.data);
        }).catch(error => {
            // Token expired/invalid, or user no longer exists: drop the stale session.
            clearSession();
            currentUser.value = null;
            errors.value.push(error);
        }).finally(() => {
            sessionLoading.value = false;
        });
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
        errors,
        sessionLoading,
        signIn,
        signUp,
        checkEmailExists,
        restoreSession
    };
});
