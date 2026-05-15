/**
 * Permission entity
 * @class Permission
 * @description
 * Permission entity is used to represent a specific system permission.
 */
export class Permission {
    constructor({ id = null, name = '' }) {
        this.id = id;
        this.name = name;
    }
}