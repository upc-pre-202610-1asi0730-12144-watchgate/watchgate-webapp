import { http } from '../../shared/infrastructure/http.api.js';

const USER_ACCESS_ENDPOINT = '/user-access';
const USERS_ENDPOINT = import.meta.env.VITE_USERS_ENDPOINT_PATH;

export class UserAccessApi {
    getCompanyProfiles(companyId) {
        return http.get(`${USER_ACCESS_ENDPOINT}/company/${companyId}`).then(response => response.data);
    }

    getCompanyInvitations(companyId) {
        return http.get(`${USER_ACCESS_ENDPOINT}/invitations/company/${companyId}`).then(response => response.data);
    }

    getUsers() {
        return http.get(USERS_ENDPOINT).then(response => response.data);
    }

    createTeamUser(resource) {
        return http.post(`${USER_ACCESS_ENDPOINT}/team-users`, resource).then(response => response.data);
    }

    inviteUser(resource) {
        return http.post(`${USER_ACCESS_ENDPOINT}/invitations`, resource).then(response => response.data);
    }

    assignAccess(userId, resource) {
        return http.post(`${USER_ACCESS_ENDPOINT}/users/${userId}/roles`, resource).then(response => response.data);
    }

    restrictZone(userId, zoneId) {
        return http.patch(`${USER_ACCESS_ENDPOINT}/users/${userId}/zone-restriction`, { zoneId }).then(response => response.data);
    }

    revokeAccess(userId) {
        return http.patch(`${USER_ACCESS_ENDPOINT}/users/${userId}/revoke`).then(response => response.data);
    }

    updateNotificationPreferences(userId, resource) {
        return http.patch(`${USER_ACCESS_ENDPOINT}/users/${userId}/notification-preferences`, resource).then(response => response.data);
    }
}
