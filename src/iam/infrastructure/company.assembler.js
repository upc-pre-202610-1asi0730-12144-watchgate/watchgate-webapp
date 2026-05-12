import { Company } from "../domain/model/company.entity.js";

export class CompanyAssembler {
    static toEntityFromResource(resource) {
        return new Company({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['companies'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}