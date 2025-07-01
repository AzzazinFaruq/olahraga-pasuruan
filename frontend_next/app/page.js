"use client";

import React from "react";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import axiosClient from "../app/auths/auth-context/axiosClient";

import { useState, useEffect } from "react";

const Dashboard = () => {
  const bannerImages = [
    { id: 1, src: "/image/banner-1.jpg", alt: "Banner 1" },
    { id: 2, src: "/image/banner-2.jpg", alt: "Banner 2" },
  ];

  const galleryImages = [
    { id: 1, alt: "Pertandingan Basket" },
    { id: 2, alt: "Upacara Pembukaan" },
    { id: 3, alt: "Atlet Berlari" },
    { id: 4, alt: "Penyerahan Medali" },
    { id: 5, alt: "Pertandingan Voli" },
    { id: 6, alt: "Lomba Renang" },
  ];

  const [pesan, setPesan] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    Promise.all([
      axiosClient.get("api/atlet"),
    ])
      .then((res) => {
        setPesan(res.data.message);
      })
      .catch((err) => {
        console.error("Gagal ambil data:", err);
      });

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 5000);

    return () => clearInterval(interval);
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

      {/* Banner */}
      <section className="relative w-full h-48 md:h-80 lg:h-160 overflow-hidden bg-gray-200">
        {bannerImages.map((img, index) => (
          <div
            key={img.id}
            className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${
              index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
          {bannerImages.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentBanner
                  ? "bg-white scale-125"
                  : "bg-gray-400/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
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
              src="/logo/logo-kabpasuruan.png"
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

        <section className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-2/3">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Sambutan
                </h2>
                <div
                  className="w-24 h-1 rounded-full"
                  style={{
                    background:
                      "linear-gradient(to right, var(--color-primary), var(--color-primary-dark))",
                  }}
                ></div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  H.M. Rusdi Sutejo
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                  <br />
                  <br />
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum. Sed ut perspiciatis unde
                  omnis iste natus error sit voluptatem accusantium doloremque
                  laudantium.
                  <br />
                  <br />
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
                  odit aut fugit, sed quia consequuntur magni dolores eos qui
                  ratione voluptatem sequi nesciunt. Neque porro quisquam est,
                  qui dolorem ipsum quia dolor sit amet.
                </p>
              </div>
            </div>

            <div className="md:w-1/3 flex justify-center">
              <div className="relative">
                <div className="rounded-xl w-80 h-120 overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src="/images/"
                    alt="H.M. Rusdi Sutejo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slider */}
        <div className="mb-16">
          <h2
            className="font-bold text-center mb-8"
            style={{
              fontSize: "var(--font-size-xlarge)",
              color: "var(--color-gray-800)",
            }}
          >
            Dokumentasi
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
                    <div className="bg-[var(--color-primary)] rounded-xl w-96 h-56 shadow-md" />
                  </div>
                ))}
                {galleryImages.map((img) => (
                  <div key={`copy-${img.id}`} className="inline-block mx-4">
                    <div className="bg-[var(--color-primary)] rounded-xl w-96 h-56 shadow-md" />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden h-64 mb-4 rounded-xl">
              <div className="absolute flex animate-scroll-reverse whitespace-nowrap">
                {galleryImages.map((img) => (
                  <div key={img.id} className="inline-block mx-4">
                    <div className="bg-[var(--color-primary)] rounded-xl w-96 h-56 shadow-md" />
                  </div>
                ))}
                {galleryImages.map((img) => (
                  <div key={`copy-${img.id}`} className="inline-block mx-4">
                    <div className="bg-[var(--color-primary)] rounded-xl w-96 h-56 shadow-md" />
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
