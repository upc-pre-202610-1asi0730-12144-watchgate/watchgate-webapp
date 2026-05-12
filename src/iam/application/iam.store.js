import { defineStore } from "pinia";
import { ref } from "vue";
import { IamApi } from "../infrastructure/iam-api.js";
import { UserAssembler } from "../infrastructure/user.assembler.js";

const iamApi = new IamApi();

export const useIamStore = defineStore('iam', () => {
    const currentUser = ref(null);
    const errors = ref([]);

    function signIn(email, password) {
        return iamApi.signIn(email, password).then(response => {
            if (response.data.length > 0) {
                currentUser.value = UserAssembler.toEntityFromResource(response.data[0]);
                return true;
            }
            return false;
        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }
    function signUp(userEntity) {
        const newCompany = {
            tradeName: userEntity.company.tradeName,
            taxId: ""
        };
        return iamApi.createCompany(newCompany).then(companyResponse => {
            const newCompanyId = companyResponse.data.id;
            const userPayload = {
                fullName: userEntity.fullName,
                email: userEntity.email,
                passwordHash: userEntity.passwordHash,
                companyId: newCompanyId,
                roleId: 2,
                notificationPreferenceId: 1
            };
            return iamApi.signUp(userPayload);

        }).then(userResponse => {
            currentUser.value = UserAssembler.toEntityFromResource(userResponse.data);
            return true;

        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }
    function checkEmailExists(email) {
        return iamApi.getUserByEmail(email).then(response => {
            return response.data.length > 0;
        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }

    return {
        currentUser,
        errors,
        signIn,
        signUp,
        checkEmailExists
    };
});