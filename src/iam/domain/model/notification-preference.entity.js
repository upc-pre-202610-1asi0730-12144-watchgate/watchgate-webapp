/**
 * Notification Preference entity
 * @class NotificationPreference
 * @description
 * NotificationPreference entity is used to represent a user's notification settings.
 */
export class NotificationPreference {
    constructor({ id = null, preferredChannel = '', isMuted = false }) {
        this.id = id;
        this.preferredChannel = preferredChannel;
        this.isMuted = isMuted;
    }
}