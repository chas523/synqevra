"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@modern-js/runtime/router";
import { Loader2Icon } from "lucide-react";
import { LoginFormData, RegisterFormData } from "../types";
import { useLogin, useRegister } from "../hooks/useAuth";

const LogInPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, success } = useLogin();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  // Handle successful registration
  useEffect(() => {
    if (success) {
      navigate("/connections");
    }
  }, [success, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password ) {
      return;
    }

    if (!formData.email.includes("@")) {
      return;
    }

    await login(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">App</h2>
        </div>

        {/* Form Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Log in to account
          </h3>
          <p className="text-center text-sm text-gray-600 mb-6">
            Enter your credentials to sign log in to this app
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@domain.com"
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2Icon
                      role="status"
                      aria-label="Loading"
                      className="size-4 animate-spin mr-2"
                    />
                    Logging in...
                  </div>
                ) : (
                  "Log in"
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have account?{" "}
              <button
                type="button"
                onClick={() => navigate("/auth/register")}
                className="font-medium text-gray-900 hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogInPage;