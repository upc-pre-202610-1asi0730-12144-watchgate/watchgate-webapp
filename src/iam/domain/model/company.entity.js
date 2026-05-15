/**
 * Company entity
 * @class Company
 * @description
 * Company entity is used to represent a company registered in the system.
 */
export class Company {
    constructor({ id = null, tradeName = '', taxId = '' }) {
        this.id = id;
        this.tradeName = tradeName;
        this.taxId = taxId;
    }
}