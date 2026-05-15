import {Company} from "./company.entity.js";
import {Role} from "./role.entity.js";
import {NotificationPreference} from "./notification-preference.entity.js";
/**
 * User entity
 * @class User
 * @description
 * User entity is used to represent a user in the IAM context.
 */
export class User {
    constructor({
                    id = null,
                    fullName = '',
                    email = '',
                    passwordHash = '',
                    company = null,
                    role = null,
                    notificationPreference = null
                }) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.company = company ? new Company(company) : null;
        this.role = role ? new Role(role) : null;
        this.notificationPreference = notificationPreference ? new NotificationPreference(notificationPreference) : null;
    }
}