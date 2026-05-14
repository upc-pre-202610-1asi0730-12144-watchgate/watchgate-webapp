import signInForm from "./views/sign-in-form.vue";
import signUpForm from "./views/sign-up-form.vue";
import recoverPassword from "./views/recover-password.vue";

/**
 * IAM Routing Configuration
 * @description
 * Defines the routes for the Identity and Access Management bounded context.
 * Includes sign-in, sign-up, and password recovery views.
 */
const iamRoutes = [
    {
        path: 'sign-in',
        name: 'sign-in',
        component: signInForm,
        meta: { title: 'Sign In' }
    },
    {
        path: 'sign-up',
        name: 'sign-up',
        component: signUpForm,
        meta: { title: 'Sign Up' }
    },
    {
        path: 'recover-password',
        name: 'recover-password',
        component: recoverPassword,
        meta: { title: 'Recover Password' }
    }
];

export default iamRoutes;