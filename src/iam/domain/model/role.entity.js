import {Permission} from "./permission.entity.js";

export class Role {
    constructor({ id = null, name = '', permissions = [] }) {
        this.id = id;
        this.name = name;
        this.permissions = permissions.map(permission =>
            permission instanceof Permission ? permission : new Permission(permission)
        );
    }
}