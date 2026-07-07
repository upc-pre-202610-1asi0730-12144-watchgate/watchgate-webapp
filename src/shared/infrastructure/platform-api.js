import { http } from './http.api.js';

export class PlatformApi {
    getHealth() {
        return http.get('/health').then(response => response.data);
    }
}
