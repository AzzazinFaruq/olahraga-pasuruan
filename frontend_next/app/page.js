"use client";

import React from "react";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import axiosClient from "../app/auths/auth-context/axiosClient";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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

  const router = useRouter();
  const sliderRef = useRef(null);
  const beritaData = [
    {
      id: 1,
      cover: "/image/berita-1.jpg",
      title: "Pasuruan Juara Umum PORPROV 2025",
      excerpt:
        "Kabupaten Pasuruan berhasil menjadi juara umum pada ajang Pekan Olahraga Provinsi (PORPROV) Jawa Timur 2025 dengan meraih 120 medali emas, 98 perak, dan 76 perunggu.",
    },
    {
      id: 2,
      cover: "/image/berita-2.jpg",
      title: "Pembangunan Stadion Baru Pasuruan",
      excerpt:
        "Pemerintah Kabupaten Pasuruan memulai pembangunan stadion baru berstandar internasional yang akan menjadi pusat pelatihan atlet.",
    },
    {
      id: 3,
      cover: "/image/berita-1.jpg",
      title: "Atlet Pasuruan Raih Medali di SEA Games",
      excerpt:
        "Atlet renang asal Pasuruan, Anisa Rahma, berhasil meraih medali emas di SEA Games 2025 pada nomor 200m gaya bebas.",
    },
    {
      id: 4,
      cover: "/image/berita-2.jpg",
      title: "Pelatnas Atlet Pasuruan",
      excerpt:
        "Sebanyak 50 atlet dari Kabupaten Pasuruan akan mengikuti pelatnas (pelatihan nasional) untuk persiapan menghadapi PON 2026.",
    },
    {
      id: 5,
      cover: "/image/berita-1.jpg",
      title: "Turnamen Sepak Bola Pelajar",
      excerpt:
        "Dinas Pemuda dan Olahraga Kabupaten Pasuruan menggelar turnamen sepak bola pelajar se-Kabupaten Pasuruan yang diikuti oleh 100 tim.",
    },
  ];

  const scrollNews = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 400;
      sliderRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleNewsClick = (id) => {
    router.push(`/berita/${id}`);
  };

  const [pesan, setPesan] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    axiosClient
      .get("api/atlet")
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
          <div className="mb-6">
            <h2
              className="text-3xl font-bold text-gray-800 mb-2"
              style={{ fontSize: "var(--font-size-large)" }}
            >
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

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl mb-10">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 flex items-center justify-center p-6">
                <div className="relative rounded-xl overflow-hidden border-4 border-white shadow-lg w-full max-w-xs aspect-[2/3]">
                  <img
                    src="image/bupati-pasuruan.png"
                    alt="H.M. Rusdi Sutejo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:w-2/3 p-6">
                <h3
                  className="font-bold text-gray-800 mb-4"
                  style={{ fontSize: "var(--font-size-large)" }}
                >
                  H.M. RUSDI SUTEJO
                  <span
                    className="block font-normal text-gray-500 mt-1"
                    style={{ fontSize: "var(--font-size-normal)" }}
                  >
                    Bupati Kabupaten Pasuruan
                  </span>
                </h3>
                <p
                  className="text-gray-600 leading-relaxed"
                  style={{ fontSize: "var(--font-size-normal)" }}
                >
                  Salam Olah Raga
                  <br />
                  Semangat Sportifitas dan Prestasi Pada Atlet-atlet Kabupaten
                  Pasuruan,
                  <br />
                  <br />
                  Selaku Bupati dan mewakili seluruh masyarakat Kabupaten
                  Pasuruan khususnya pecinta olah raga, Kami sampaikan selamat
                  kepada KONI Kabupaten Pasuruan masa bakti 2025-2029. Ketua dan
                  Pengurus KONI yang baru dilantik saat ini harus langsung
                  tancap gas bersama dengan seluruh atlet, Cabor, serta berbagai
                  Pihak dalam menyongsong pretasi dan sportifitas dalam ajang
                  PORPROV Jatim IV tahun 2025 di Malang Raya. Kabupaten Pasuruan
                  pada event Proprov IX ini, mengirimkan Sebanyak 630 atlet,
                  pelatih dan official dari beberapa cabang olahraga (cabor) .
                  Dengan ridho Alloh SWT, kekompakan, soliditas, serta
                  perjuangan kami yakin seluruh atlet dan official yang berjuang
                  akan mendapatkan hasil yang maksimal. Sekalil lagi semangat
                  dan membawa prestasi yang Membanggakan
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl mb-10">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 flex items-center justify-center p-6">
                <div className="relative rounded-xl overflow-hidden border-4 border-white shadow-lg w-full max-w-xs aspect-[2/3]">
                  <img
                    src="image/ketua-koni.jpeg"
                    alt="H.M. Rusdi Sutejo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:w-2/3 p-6">
                <h3
                  className="font-bold text-gray-800 mb-4"
                  style={{ fontSize: "var(--font-size-large)" }}
                >
                  MAMAT ARYO SETIAWAN
                  <span
                    className="block font-normal text-gray-500 mt-1"
                    style={{ fontSize: "var(--font-size-normal)" }}
                  >
                    Ketua Umum KONI Kabupaten Pasuruan
                  </span>
                </h3>
                <p
                  className="text-gray-600 leading-relaxed"
                  style={{ fontSize: "var(--font-size-normal)" }}
                >
                  Salam Olah Raga
                  <br />
                  Salam sehat dan sportif untuk meraih prestasi
                  <br />
                  <br />
                  Amanat bapak Bupati dan seluruh masyarakat pecinta olah raga
                  Kabupaten Pasuruan kepada Kami dan Pengurus KONI Kabupaten
                  Pasuruan masa bakti 2025 -2029 merupakan amanat perjuangan
                  yang besar untuk melanjutkan perkaderan bagi anak-anak muda
                  Pasuruan di bidang olah raga. Oleh karena itu semangat kami
                  adalah berorientasi pada peningkatan pembinaan secara
                  transparan, terukur dan membawa prestasi baik bagi atlet,
                  cabor, serta secara khusus Kabupaten Pasuruan. Pengursu KONI
                  yang baru dilantik bersama Atlet dan Official, segera berjuang
                  dalam ajang Porprov IX tahun 2025 Provinsi Jawa Timur. Kami
                  mohon doa dan dukungan, semoga dengan perjuangan, soliditas
                  serta sportifitas akan membawa prestasi yang membanggakan bagi
                  atlet dan seluruh masyarakat Kabupaten Pasuruan.
                </p>
              </div>
            </div>
          </div>
        </section>

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

        <section className="mb-16 px-4">
          <div className="mb-6">
            <h2
              className="text-3xl font-bold text-gray-800 mb-2"
              style={{ fontSize: "var(--font-size-large)" }}
            >
              Berita Terkini
            </h2>
            <div
              className="w-24 h-1 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, var(--color-primary), var(--color-primary-dark))",
              }}
            ></div>
          </div>

          <div className="relative news-slider-container">
            {/* Navigation buttons - hidden by default, show on hover */}
            <button
              onClick={() => scrollNews("prev")}
              className="news-navigation absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-opacity duration-300 opacity-0"
              aria-label="Previous news"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={() => scrollNews("next")}
              className="news-navigation absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-opacity duration-300 opacity-0"
              aria-label="Next news"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* News cards slider */}
            <div
              ref={sliderRef}
              className="flex overflow-x-auto hide-scrollbar space-x-6 py-2 px-2"
            >
              {beritaData.map((berita) => (
                <div
                  key={berita.id}
                  onClick={() => handleNewsClick(berita.id)}
                  className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={berita.cover}
                      alt={berita.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    {/* Hapus kategori dan tanggal */}
                    <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">
                      {berita.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {berita.excerpt}
                    </p>
                    <div className="mt-4 flex items-center text-[var(--color-primary)] text-sm font-medium">
                      Baca selengkapnya
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
