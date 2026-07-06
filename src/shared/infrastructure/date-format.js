export function formatLimaDateTime(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Lima',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(value));
}

export function nextMonthlyBillingDate(value = new Date()) {
    const date = new Date(value);
    date.setMonth(date.getMonth() + 1);
    return formatLimaDateTime(date);
}
