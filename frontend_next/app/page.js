// app/page.js
"use client";

import React from "react";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import axios from "axios";
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const galleryImages = [
    { id: 1, alt: "Pertandingan Basket" },
    { id: 2, alt: "Upacara Pembukaan" },
    { id: 3, alt: "Atlet Berlari" },
    { id: 4, alt: "Penyerahan Medali" },
    { id: 5, alt: "Pertandingan Voli" },
    { id: 6, alt: "Lomba Renang" },
  ];

  const [pesan, setPesan] = useState('');

  useEffect(() => {
    axios.get("http://localhost:8080/api/atlet")
      .then((res) => {
        setPesan(res.data.message);
      })
      .catch((err) => {
        console.error('Gagal ambil data:', err);
      });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header*/}
        <div
          className="flex flex-col md:flex-row items-center justify-between mb-12"
          style={{
            background:
              "linear-gradient(to right, var(--color-gray-100), var(--color-gray-200))",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="mb-8 md:mb-0 md:mr-8 flex items-center justify-center">
            <img
              src="/logo-kabpasuruan.png"
              alt="Logo Kab. Pasuruan"
              className="w-48 h-48 object-contain"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
              <div
                className="font-bold text-center"
                style={{
                  fontSize: "var(--font-size-xlarge)",
                  color: "var(--color-primary)",
                }}
              >
                14,340
              </div>
              <div
                className="font-semibold text-center mt-2"
                style={{ fontSize: "var(--font-size-small)" }}
              >
                TOTAL ATLET
              </div>
              <div
                className="mt-4 h-2"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-primary), var(--color-primary-dark))",
                  borderRadius: "9999px",
                }}
              ></div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
              <div
                className="font-bold text-center"
                style={{
                  fontSize: "var(--font-size-xlarge)",
                  color: "var(--color-primary)",
                }}
              >
                85
              </div>
              <div
                className="font-semibold text-center mt-2"
                style={{ fontSize: "var(--font-size-small)" }}
              >
                CABANG OLAHRAGA
              </div>
              <div
                className="mt-4 h-2"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-primary), var(--color-primary-dark))",
                  borderRadius: "9999px",
                }}
              ></div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
              <div
                className="font-bold text-center"
                style={{
                  fontSize: "var(--font-size-xlarge)",
                  color: "var(--color-primary)",
                }}
              >
                245
              </div>
              <div
                className="font-semibold text-center mt-2"
                style={{ fontSize: "var(--font-size-small)" }}
              >
                NO. PERTANDINGAN
              </div>
              <div
                className="mt-4 h-2"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-primary), var(--color-primary-dark))",
                  borderRadius: "9999px",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="mb-16">
          <h2
            className="font-bold text-center mb-8"
            style={{
              fontSize: "var(--font-size-xlarge)",
              color: "var(--color-gray-800)",
            }}
          >
            DOKUMENTASI
          </h2>
          <div
            className="relative w-full overflow-hidden rounded-2xl p-4"
            style={{
              backgroundColor: "var(--color-gray-100)",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="relative overflow-hidden h-64 mb-4 rounded-xl">
              <div className="absolute flex animate-scroll whitespace-nowrap">
                {galleryImages.map((img) => (
                  <div key={img.id} className="inline-block mx-4">
                    <div
                      className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl w-96 h-56 flex items-center justify-center font-medium shadow-md"
                      style={{ fontSize: "var(--font-size-normal)" }}
                    >
                      {img.alt}
                    </div>
                  </div>
                ))}
                {galleryImages.map((img) => (
                  <div key={`copy-${img.id}`} className="inline-block mx-4">
                    <div
                      className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl w-96 h-56 flex items-center justify-center font-medium shadow-md"
                      style={{ fontSize: "var(--font-size-normal)" }}
                    >
                      {img.alt}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden h-64 mb-4 rounded-xl">
              <div className="absolute flex animate-scroll-reverse whitespace-nowrap">
                {galleryImages.map((img) => (
                  <div key={img.id} className="inline-block mx-4">
                    <div
                      className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl w-96 h-56 flex items-center justify-center font-medium shadow-md"
                      style={{ fontSize: "var(--font-size-normal)" }}
                    >
                      {img.alt}
                    </div>
                  </div>
                ))}
                {galleryImages.map((img) => (
                  <div key={`copy-${img.id}`} className="inline-block mx-4">
                    <div
                      className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl w-96 h-56 flex items-center justify-center font-medium shadow-md"
                      style={{ fontSize: "var(--font-size-normal)" }}
                    >
                      {img.alt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
