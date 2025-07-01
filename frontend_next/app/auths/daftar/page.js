"use client";

import React, { useState } from "react";
import Image from "next/image";
import Logo from "@/public/logo/logo-koni-black.png";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/app/auths/auth-context/axiosClient";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setFormError("");

    let hasError = false;

    if (password.length < 8) {
      setPasswordError("Password minimal 8 karakter");
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Password dan konfirmasi password tidak cocok");
      hasError = true;
    }

    if (hasError) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosClient.post("/register", {
        username,
        email,
        password,
        confirm_password: confirmPassword,
      });

      if (response.data.status) {
        router.push("/auths/masuk");
      } else {
        setFormError(response.data.error || "Registrasi gagal");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Koneksi ke server gagal";

      if (errorMessage === "Email/Username sudah digunakan") {
        setUsernameError(errorMessage);
        setEmailError(errorMessage);
      } else if (errorMessage.includes("username")) {
        setUsernameError(errorMessage);
      } else if (errorMessage.includes("email")) {
        setEmailError(errorMessage);
      } else if (errorMessage.includes("password")) {
        setPasswordError(errorMessage);
      } else if (
        errorMessage.includes("konfirmasi") ||
        errorMessage.includes("confirm")
      ) {
        setConfirmPasswordError(errorMessage);
      } else {
        setFormError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="w-full max-w-md">
        <div
          className="bg-white rounded-2xl shadow-lg p-12"
          style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-16">
              <Image
                src={Logo}
                alt="DISPORA KAB. PASURUAN"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {formError && (
            <div
              className="mb-6 p-3 rounded-lg text-center"
              style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}
            >
              <p className="text-red-600 font-medium">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-1">
              <label
                htmlFor="username"
                className="block mb-2 font-medium"
                style={{ color: "var(--color-gray-700)" }}
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                }}
                required
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  borderColor: usernameError
                    ? "#ef4444"
                    : "var(--color-gray-300)",
                  backgroundColor: "var(--color-gray-100)",
                  color: "var(--color-gray-800)",
                  focusBorderColor: "var(--color-primary)",
                  focusRingColor: "var(--color-primary)",
                }}
                placeholder={usernameError ? usernameError : "Username"}
              />
              {usernameError && (
                <p className="text-red-500 text-sm mt-1">{usernameError}</p>
              )}
            </div>

            <div className="mb-1">
              <label
                htmlFor="email"
                className="block mb-2 font-medium"
                style={{ color: "var(--color-gray-700)" }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                required
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  borderColor: emailError ? "#ef4444" : "var(--color-gray-300)",
                  backgroundColor: "var(--color-gray-100)",
                  color: "var(--color-gray-800)",
                  focusBorderColor: "var(--color-primary)",
                  focusRingColor: "var(--color-primary)",
                }}
                placeholder={emailError ? emailError : "example@gmail.com"}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div className="mb-1">
              <label
                htmlFor="password"
                className="block mb-2 font-medium"
                style={{ color: "var(--color-gray-700)" }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                required
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  borderColor: passwordError
                    ? "#ef4444"
                    : "var(--color-gray-300)",
                  backgroundColor: "var(--color-gray-100)",
                  color: "var(--color-gray-800)",
                  focusBorderColor: "var(--color-primary)",
                  focusRingColor: "var(--color-primary)",
                }}
                placeholder={passwordError ? passwordError : "••••••••"}
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            <div className="mb-8">
              <label
                htmlFor="confirmPassword"
                className="block mb-2 font-medium"
                style={{ color: "var(--color-gray-700)" }}
              >
                Konfirmasi Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError("");
                }}
                required
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  borderColor: confirmPasswordError
                    ? "#ef4444"
                    : "var(--color-gray-300)",
                  backgroundColor: "var(--color-gray-100)",
                  color: "var(--color-gray-800)",
                  focusBorderColor: "var(--color-primary)",
                  focusRingColor: "var(--color-primary)",
                }}
                placeholder={
                  confirmPasswordError ? confirmPasswordError : "••••••••"
                }
              />
              {confirmPasswordError && (
                <p className="text-red-500 text-sm mt-1">
                  {confirmPasswordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-bold transition-colors duration-300 flex items-center justify-center"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-white)",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm" style={{ color: "var(--color-gray-500)" }}>
              Sudah punya akun?{" "}
              <Link
                href="/auths/masuk"
                className="text-blue-600 hover:underline"
              >
                Masuk disini
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: "var(--color-gray-500)" }}>
            © 2025 KONI Kabupaten Pasuruan. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
