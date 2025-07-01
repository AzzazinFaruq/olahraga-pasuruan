"use client";

import React, { useState } from "react";
import { useAuth } from '@/app/auths/auth-context/page';
import Image from "next/image";
import Logo from "@/public/logo/logo-koni-black.png";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/app/auths/auth-context/axiosClient";
import Swal from "sweetalert2";

const LoginPage = () => {
  const { login } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailError("");
    setPasswordError("");
    setFormError("");

    try {
      const response = await axiosClient.post("/login", {
        email,
        password,
        remember_me: rememberMe,
      },
      {
        withCredentials: true,
      });

      if (response.data.status) {
        login({
          username: response.data.data.username,
          email: response.data.data.email,
          role: response.data.data.role
        });

        Swal.fire({
          icon: "success",
          title: "Login Berhasil!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: "custom-swal-popup",
            icon: "custom-swal-icon",
            title: "custom-swal-title",
          },
        });
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setFormError(response.data.error || "Login gagal");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Koneksi ke server gagal";

      // Handle spesific errors from backend
      if (errorMessage === "Email belum terdaftar") {
        setEmailError(errorMessage);
      } else if (errorMessage === "Password tidak sesuai") {
        setPasswordError(errorMessage);
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

            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="rememberMe">Ingat saya</label>
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
                "Login"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm" style={{ color: "var(--color-gray-500)" }}>
              Belum punya akun?{" "}
              <Link
                href="/auths/daftar"
                className="text-blue-600 hover:underline"
              >
                Daftar disini
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

export default LoginPage;
