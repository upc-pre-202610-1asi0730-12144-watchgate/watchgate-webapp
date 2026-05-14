import { Role } from "../domain/model/role.entity.js";

/**
 * Role assembler
 * @class RoleAssembler
 * @description
 * Role assembler is used to map role resources into domain entities.
 */
export class RoleAssembler {
    static toEntityFromResource(resource) {
        return new Role({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['roles'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}