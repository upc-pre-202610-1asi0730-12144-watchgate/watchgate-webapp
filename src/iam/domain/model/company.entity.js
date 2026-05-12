export class Company {
    constructor({ id = null, tradeName = '', taxId = '' }) {
        this.id = id;
        this.tradeName = tradeName;
        this.taxId = taxId;
    }
}