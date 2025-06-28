"use client";

import React, { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      style={{
        background: `var(--color-primary)`,
        color: "var(--color-white)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="text-xl font-bold">
            <Link href="/">DISPORA KAB. PASURUAN</Link>
          </div>

          {/* Desktop Navigation (≥768px) */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/daftar-atlet"
              className="font-medium hover:opacity-80 transition-opacity"
            >
              Daftar Atlet
            </Link>
            <Link
              href="/hasil-pertandingan"
              className="font-medium hover:opacity-80 transition-opacity"
            >
              Hasil Pertandingan
            </Link>
            <Link
              href="/dokumentasi"
              className="font-medium hover:opacity-80 transition-opacity"
            >
              Dokumentasi
            </Link>
          </div>

          {/* (Visible <768px) */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
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

        {/* Mobile Navigation (Visible <768px) */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/daftar-atlet"
                className="font-medium hover:opacity-80 transition-opacity"
                onClick={toggleMenu}
              >
                Daftar Atlet
              </Link>
              <Link
                href="/hasil-pertandingan"
                className="font-medium hover:opacity-80 transition-opacity"
                onClick={toggleMenu}
              >
                Hasil Pertandingan
              </Link>
              <Link
                href="/dokumentasi"
                className="font-medium hover:opacity-80 transition-opacity"
                onClick={toggleMenu}
              >
                Dokumentasi
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
