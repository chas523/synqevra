"use client";

import { useState, Suspense } from "react";
import LoginForm from "../organisms/LoginForm";
import logoDarkStatic from "@/public/logo.svg";
import logoLightStatic from "@/public/logo-white.svg";

const LoginFormPage = () => {
  const [imgErrorDarkTheme, setImgErrorDarkTheme] = useState(false);
  const [imgErrorLightTheme, setImgErrorLightTheme] = useState(false);

  return (
    <div className="flex-1 relative bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors">
      <Suspense fallback={<div />}>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LoginFormPage;
