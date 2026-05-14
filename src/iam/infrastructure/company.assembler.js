import { Company } from "../domain/model/company.entity.js";
/**
 * Company assembler
 * @class CompanyAssembler
 * @description
 * Company assembler is used to map company resources into domain entities.
 */
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