"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/auths/auth-context/page";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import LogoBlack from "@/public/logo/logo-koni-black.png";
import LogoWhite from "@/public/logo/logo-koni-white.png";
import Swal from "sweetalert2";
import axiosClient from "../auths/auth-context/axiosClient";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === "/";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) setActiveDropdown(null);
  };

  const handleMouseEnter = (dropdownName) => {
    clearTimeout(hoverTimeout);
    setActiveDropdown(dropdownName);
  };

  const handleMouseLeave = (dropdownName) => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleLogout = () => {
    axiosClient.post("api/logout");
    logout();
    Swal.fire({
      icon: "success",
      title: "Logout Berhasil!",
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
  };

  return (
    <nav
      style={{
        background: isDashboard ? "var(--background)" : "var(--color-primary)",
        color: isDashboard ? "var(--foreground)" : "var(--color-white)",
        position: "relative",
        zIndex: 50,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="relative w-48 h-16">
            <Link href="/">
              <Image
                src={isDashboard ? LogoBlack : LogoWhite}
                alt="Logo KONI"
                fill
                className="object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/daftar-berita"
              className="font-medium hover:opacity-80 transition-opacity"
            >
              Berita
            </Link>

            <Link
              href="/daftar-atlet"
              className="font-medium hover:opacity-80 transition-opacity"
            >
              Atlet
            </Link>

            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("results")}
              onMouseLeave={() => handleMouseLeave("results")}
            >
              <Link
                href="#"
                onClick={(e) => e.preventDefault()}
                className="font-medium hover:opacity-80 transition-opacity flex items-center"
              >
                Pertandingan
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>

              {activeDropdown === "results" && (
                <div
                  className="absolute bg-white shadow-lg rounded-md mt-2 min-w-[200px]"
                  style={{ zIndex: 100 }}
                  onMouseEnter={() => handleMouseEnter("results")}
                  onMouseLeave={() => handleMouseLeave("results")}
                >
                  <Link
                    href="/hasil-pertandingan/porprov"
                    className="block text-gray-800 hover:bg-gray-100 rounded-md px-4 py-2"
                    onClick={() => setActiveDropdown(null)}
                  >
                    PORPROV JATIM IX
                  </Link>
                  <Link
                    href="/hasil-pertandingan"
                    className="block text-gray-800 hover:bg-gray-100 rounded-md px-4 py-2"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Event Lainnya
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/dokumentasi"
              className="font-medium hover:opacity-80 transition-opacity"
            >
              Dokumentasi
            </Link>

            {user ? (
              // Profile Dropdown
              <div
                className="relative ml-4"
                onMouseEnter={() => handleMouseEnter("profile")}
                onMouseLeave={() => handleMouseLeave("profile")}
              >
                <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center focus:outline-none">
                  <span className="text-gray-700 font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </button>

                {activeDropdown === "profile" && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    onMouseEnter={() => handleMouseEnter("profile")}
                    onMouseLeave={() => handleMouseLeave("profile")}
                  >
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  href="/auths/daftar"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px solid ${
                      isDashboard
                        ? "var(--color-primary)"
                        : "var(--color-white)"
                    }`,
                    color: isDashboard
                      ? "var(--color-primary)"
                      : "var(--color-white)",
                  }}
                  className="font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Daftar
                </Link>
                <Link
                  href="/auths/masuk"
                  style={{
                    backgroundColor: isDashboard
                      ? "var(--color-primary)"
                      : "var(--color-white)",
                    color: isDashboard
                      ? "var(--color-white)"
                      : "var(--color-primary)",
                  }}
                  className="font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Masuk
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/daftar-berita"
                className="font-medium hover:opacity-80 transition-opacity"
                onClick={toggleMenu}
              >
                Berita
              </Link>
          
              <Link
                href="/daftar-atlet"
                className="font-medium hover:opacity-80 transition-opacity"
                onClick={toggleMenu}
              >
                Atlet
              </Link>

              <div className="flex flex-col">
                <button
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "results" ? null : "results"
                    )
                  }
                  className="font-medium hover:opacity-80 transition-opacity flex justify-between items-center w-full"
                >
                  <span>Pertandingan</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      activeDropdown === "results" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {activeDropdown === "results" && (
                  <div className="pl-4 mt-2 space-y-2">
                    <Link
                      href="/hasil-pertandingan/porprov"
                      className="block font-medium hover:opacity-80 transition-opacity"
                      onClick={toggleMenu}
                    >
                      PORPROV JATIM IX
                    </Link>
                    <Link
                      href="/hasil-pertandingan"
                      className="block font-medium hover:opacity-80 transition-opacity"
                      onClick={toggleMenu}
                    >
                      Event Lainnya
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/dokumentasi"
                className="font-medium hover:opacity-80 transition-opacity"
                onClick={toggleMenu}
              >
                Dokumentasi
              </Link>

              {user ? (
                <div className="mt-4">
                  <button
                    onClick={handleLogout}
                    className={`w-full mt-2 py-2 px-4 font-bold rounded-lg transition-colors ${
                      isDashboard
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-white text-[var(--color-primary)] hover:bg-gray-200"
                    }`}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4 mt-4">
                  <Link
                    href="/auths/daftar"
                    style={{
                      backgroundColor: "transparent",
                      border: `2px solid ${
                        isDashboard
                          ? "var(--color-primary)"
                          : "var(--color-white)"
                      }`,
                      color: isDashboard
                        ? "var(--color-primary)"
                        : "var(--color-white)",
                    }}
                    className="font-bold py-2 px-4 rounded-lg text-center"
                    onClick={toggleMenu}
                  >
                    Daftar
                  </Link>
                  <Link
                    href="/auths/masuk"
                    style={{
                      backgroundColor: isDashboard
                        ? "var(--color-primary)"
                        : "var(--color-white)",
                      color: isDashboard
                        ? "var(--color-white)"
                        : "var(--color-primary)",
                    }}
                    className="font-bold py-2 px-4 rounded-lg text-center"
                    onClick={toggleMenu}
                  >
                    Masuk
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
