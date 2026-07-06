import { http } from '../../shared/infrastructure/http.api.js';

const USER_ACCESS_ENDPOINT = import.meta.env.VITE_USER_ACCESS_ENDPOINT_PATH || '/user-access';

export class UserAccessApi {
    createTeamUser(resource) {
        return http.post(`${USER_ACCESS_ENDPOINT}/team-users`, resource);
    }

    inviteUser(resource) {
        return http.post(`${USER_ACCESS_ENDPOINT}/invitations`, resource);
    }

    getCompanyInvitations(companyId) {
        return http.get(`${USER_ACCESS_ENDPOINT}/invitations/company/${companyId}`);
    }

    assignRole(userId, resource) {
        return http.post(`${USER_ACCESS_ENDPOINT}/users/${userId}/roles`, resource);
    }

    restrictZone(userId, zoneId) {
        return http.patch(`${USER_ACCESS_ENDPOINT}/users/${userId}/zone-restriction`, { zoneId });
    }

    revokeAccess(userId) {
        return http.patch(`${USER_ACCESS_ENDPOINT}/users/${userId}/revoke`);
    }

    updateNotificationPreferences(userId, resource) {
        return http.patch(`${USER_ACCESS_ENDPOINT}/users/${userId}/notification-preferences`, resource);
    }

    getCompanyProfiles(companyId) {
        return http.get(`${USER_ACCESS_ENDPOINT}/company/${companyId}`);
    }
}
