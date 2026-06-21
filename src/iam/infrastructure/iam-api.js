import { http } from '../../shared/infrastructure/http.api.js';

const AUTH_ENDPOINT = import.meta.env.VITE_AUTH_ENDPOINT_PATH;
const USERS_ENDPOINT = import.meta.env.VITE_USERS_ENDPOINT_PATH;

/**
 * IAM API Service
 * @class IamApi
 * @description
 * IAM API service is used to communicate with the Identity and Access Management endpoints
 * of the Watchgate Locksight backend (AuthenticationController / UsersController).
 */
export class IamApi {
    /**
     * Sign in a user against the backend. Returns an AuthenticatedUserResource
     * ({ id, fullName, email, role, token }).
     * @param {string} email
     * @param {string} password
     * @returns {Promise}
     */
    signIn(email, password) {
        return http.post(`${AUTH_ENDPOINT}/sign-in`, { email, password });
    }

    /**
     * Sign up a new user and company in a single call. Returns an
     * AuthenticatedUserResource ({ id, fullName, email, role, token }).
     * @param {{ fullName: string, email: string, password: string, tradeName: string, taxId: string }} signUpResource
     * @returns {Promise}
     */
    signUp(signUpResource) {
        return http.post(`${AUTH_ENDPOINT}/sign-up`, signUpResource);
    }

    /**
     * Get a user by ID (requires a valid bearer token). Returns a UserResource
     * ({ id, fullName, email, role, companyId }).
     * @param {number|string} id
     * @returns {Promise}
     */
    getUserById(id) {
        return http.get(`${USERS_ENDPOINT}/${id}`);
    }
}
