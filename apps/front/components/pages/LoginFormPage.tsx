"use client";

import { useState } from "react";
import LoginForm from "../organisms/LoginForm";
import logoDarkStatic from "@/public/logo.svg";
import logoLightStatic from "@/public/logo-white.svg";

const LoginFormPage = () => {
  const [imgErrorDarkTheme, setImgErrorDarkTheme] = useState(false);
  const [imgErrorLightTheme, setImgErrorLightTheme] = useState(false);

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mb-8 absolute top-8 sm:relative sm:top-0">
        {/* Light Theme Logo (Displayed on White background) */}
        <img
          src={imgErrorLightTheme ? logoDarkStatic.src : "/public-assets/global/logo-dark.svg"}
          alt="Platform Logo"
          className="h-10 w-auto dark:hidden"
          onError={() => setImgErrorLightTheme(true)}
        />
        {/* Dark Theme Logo (Displayed on Dark background) */}
        <img
          src={imgErrorDarkTheme ? logoLightStatic.src : "/public-assets/global/logo-white.svg"}
          alt="Platform Logo"
          className="h-10 w-auto hidden dark:block"
          onError={() => setImgErrorDarkTheme(true)}
        />
      </div>
      <LoginForm />
    </div>
  );
};

export default LoginFormPage;
