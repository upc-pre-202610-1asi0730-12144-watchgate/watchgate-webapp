import axios from 'axios';

const http = axios.create({
    baseURL: import.meta.env.VITE_MOCK_API_BASE_URL
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
     * @param {string} email
     * @param {string} password
     * @returns {Promise}
     */
    signIn(email, password) {
        return http.get(`${USERS_ENDPOINT}?email=${email}&password=${password}`);
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
        return http.get(`${USERS_ENDPOINT}?email=${email}`);
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