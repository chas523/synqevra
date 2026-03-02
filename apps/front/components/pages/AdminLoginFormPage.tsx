"use client";

import LoginForm from "../organisms/LoginForm";



const LoginFormPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors">
            <LoginForm />
        </div>
    );
};

export default LoginFormPage;
