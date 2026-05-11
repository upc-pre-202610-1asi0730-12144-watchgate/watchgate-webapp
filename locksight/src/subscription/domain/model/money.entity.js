export class Money {
    constructor(amount = 0, currency = 'USD') {
        this.amount = amount;
        this.currency = currency;
    }

    format() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.currency,
        }).format(this.amount);
    }
}