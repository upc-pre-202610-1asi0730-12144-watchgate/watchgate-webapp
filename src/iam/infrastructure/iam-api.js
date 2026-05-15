import axios from 'axios';

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

const USERS_ENDPOINT = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const COMPANIES_ENDPOINT = import.meta.env.VITE_COMPANIES_ENDPOINT_PATH;

/**
 * IAM API Service
 * @class IamApi
 * @description
 * IAM API service is used to communicate with the Identity and Access Management endpoints.
 */
export class IamApi {
    /**
     * Sign in a user
     * Filtra por email primero (json-server 1.x compatible) y luego
     * compara el password en el cliente, ya que json-server 1.x no
     * soporta múltiples query params como filtros simultáneos.
     * @param {string} email
     * @param {string} password
     * @returns {Promise}
     */
    signIn(email, password) {
        return http.get(`${USERS_ENDPOINT}?email=${encodeURIComponent(email)}`)
            .then(response => {
                const users = response.data;
                const match = users.filter(
                    u => u.password === password || u.passwordHash === password
                );
                return { data: match };
            });
    }

    /**
     * Sign up a new user
     * @param {object} userResource
     * @returns {Promise}
     */
    signUp(userResource) {
        return http.post(USERS_ENDPOINT, userResource);
    }

    /**
     * Get a user by email
     * @param {string} email
     * @returns {Promise}
     */
    getUserByEmail(email) {
        return http.get(`${USERS_ENDPOINT}?email=${encodeURIComponent(email)}`);
    }

    /**
     * Create a new company
     * @param {object} companyResource
     * @returns {Promise}
     */
    createCompany(companyResource) {
        return http.post(COMPANIES_ENDPOINT, companyResource);
    }
}