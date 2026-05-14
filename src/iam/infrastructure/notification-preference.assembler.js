import { NotificationPreference } from "../domain/model/notification-preference.entity.js";

/**
 * Notification Preference assembler
 * @class NotificationPreferenceAssembler
 * @description
 * NotificationPreference assembler is used to map notification preference resources into domain entities.
 */
export class NotificationPreferenceAssembler {

    static toEntityFromResource(resource) {
        return new NotificationPreference({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['notificationPreferences'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}