import {Permission} from "./permission.entity.js";
/**
 * Role entity
 * @class Role
 * @description
 * Role entity is used to represent a role assigned to a user.
 */
export class Role {
    constructor({ id = null, name = '', permissions = [] }) {
        this.id = id;
        this.name = name;
        this.permissions = permissions.map(permission =>
            permission instanceof Permission ? permission : new Permission(permission)
        );
    }
}