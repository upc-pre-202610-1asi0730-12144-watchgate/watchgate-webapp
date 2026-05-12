export class NotificationPreference {
    constructor({ id = null, preferredChannel = '', isMuted = false }) {
        this.id = id;
        this.preferredChannel = preferredChannel;
        this.isMuted = isMuted;
    }
}