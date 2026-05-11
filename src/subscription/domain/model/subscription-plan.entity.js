import {Money} from "./money.entity.js";

export class SubscriptionPlan {
    constructor({ id, name, price, warehouseLimit }) {
        this.id = id;
        this.name = name;

        this.price = new Money(price.amount, price.currency);
        this.warehouseLimit = warehouseLimit;
    }
}