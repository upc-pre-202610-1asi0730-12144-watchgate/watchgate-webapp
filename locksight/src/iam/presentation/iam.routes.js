import SignInForm from "./views/sign-in-form.vue";
import RecoverPassword from "./views/recover-password.vue";
import SignUpContent from "./views/sign-up-form.vue";

const iamRoutes = [
    {
        path: 'sign-in',
        name: 'sign-in',
        component: SignInForm,
        meta: { title: 'Sign In' }
    },
    {
        path: 'recover-password',
        name: 'recover-password',
        component: RecoverPassword,
        meta: { title: 'Recover Password' }
    },
    {
        path: 'sign-up',
        name: 'sign-up',
        component: SignUpContent,
        meta: { title: 'Sign Up' }
    }
];

export default iamRoutes;