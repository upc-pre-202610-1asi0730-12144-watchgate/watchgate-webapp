import axios from 'axios';

const http = axios.create({
    baseURL: 'http://localhost:3000'
});
export class IamApi {
    signIn(email, password) {
        return http.get(`/users?email=${email}&password=${password}`);
    }

    signUp(userResource) {
        return http.post('/users', userResource);
    }

    getUserByEmail(email) {
        return http.get(`/users?email=${email}`);
    }
    createCompany(companyResource) {
        return http.post('/companies', companyResource);
    }
}