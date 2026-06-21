import {Company} from "./company.entity.js";
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
                    companyId = null,
                    role = null,
                    notificationPreference = null,
                    token = null
                }) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.company = company ? new Company(company) : null;
        // Backend only returns the company's id on the user resource, not a nested object.
        this.companyId = companyId;
        // Backend returns the role as a plain string (e.g. "Administrator"), not a Role object.
        this.role = role;
        this.notificationPreference = notificationPreference ? new NotificationPreference(notificationPreference) : null;
        this.token = token;
    }
}