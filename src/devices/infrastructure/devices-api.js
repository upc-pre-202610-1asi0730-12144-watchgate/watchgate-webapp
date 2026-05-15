const BASE_URL = 'https://locksight-mockapi.azurewebsites.net/devices';

export class DevicesApi {
    async getAll() {
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch devices');
        return response.json();
    }

    async create(resource) {
        const response = await fetch(BASE_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(resource),
        });
        if (!response.ok) throw new Error('Failed to create device');
        return response.json();
    }

    async remove(id) {
        const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete device');
    }
}