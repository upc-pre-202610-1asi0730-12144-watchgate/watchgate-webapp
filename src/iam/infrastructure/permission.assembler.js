import { Permission } from "../domain/model/permission.entity.js";

export class PermissionAssembler {
    static toEntityFromResource(resource) {
        return new Permission({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['permissions'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}