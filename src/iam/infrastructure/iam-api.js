import axios from 'axios';

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

const USERS_ENDPOINT = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const COMPANIES_ENDPOINT = import.meta.env.VITE_COMPANIES_ENDPOINT_PATH;

export class IamApi {
    signIn(email, password) {
        return http.get(`${USERS_ENDPOINT}?email=${email}&password=${password}`);
    }

    signUp(userResource) {
        return http.post(USERS_ENDPOINT, userResource);
    }

    getUserByEmail(email) {
        return http.get(`${USERS_ENDPOINT}?email=${email}`);
    }

    createCompany(companyResource) {
        return http.post(COMPANIES_ENDPOINT, companyResource);
    }
}