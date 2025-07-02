"use client";

import React from "react";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { useParams, useRouter } from "next/navigation";

const NewsDetail = () => {
  const { id } = useParams();
  const router = useRouter();

  const beritaData = [
    {
      id: 1,
      cover: "/image/berita-1.jpg",
      title: "Pasuruan Juara Umum PORPROV 2025",
      excerpt: "Kabupaten Pasuruan berhasil menjadi juara umum...",
      content: `<p class="mb-4">Kabupaten Pasuruan berhasil menjadi juara umum pada ajang Pekan Olahraga Provinsi (PORPROV) Jawa Timur 2025 yang diselenggarakan di Malang. Kontingen Pasuruan meraih total 294 medali dengan rincian 120 emas, 98 perak, dan 76 perunggu.</p>
      <p class="mb-4">Prestasi ini melampaui target yang ditetapkan oleh KONI Kabupaten Pasuruan dan menjadi yang terbaik sepanjang sejarah keikutsertaan Pasuruan dalam PORPROV. Bupati Pasuruan, H.M. Rusdi Sutejo, menyampaikan apresiasi yang tinggi kepada seluruh atlet, pelatih, dan official yang telah berjuang keras.</p>
      <p class="mb-4">"Prestasi ini adalah bukti kerja keras dan dedikasi seluruh komponen olahraga di Kabupaten Pasuruan. Kami akan terus mendukung pengembangan olahraga melalui pembinaan berkelanjutan dan peningkatan fasilitas olahraga," ujar Bupati dalam konferensi pers.</p>
      <p class="mb-4">Cabang olahraga yang menyumbang medali terbanyak adalah atletik dengan 32 emas, renang 18 emas, dan bulutangkis 15 emas. Puncak kejayaan terjadi pada hari terakhir ketika tim sepak takraw putra berhasil mengalahkan Surabaya di final dengan skor 2-1.</p>
      <p>KONI Kabupaten Pasuruan akan segera mempersiapkan atlet untuk mengikuti Pekan Olahraga Nasional (PON) 2026 di Sumatera Utara. Sebanyak 150 atlet terbaik akan menjalani pemusatan latihan nasional mulai bulan depan.</p>`,
      date: "15 Juni 2025",
    },
  ];

  const berita = beritaData.find((item) => item.id === parseInt(id));

  if (!berita) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Berita tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => router.back()}
          className="inline-block cursor-pointer"
          style={{ color: "var(--color-primary)" }}
        >
          &larr; Kembali
        </button>

        <article>
          <div className="mb-6">
            {/* Hapus kategori */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 mt-4">
              {berita.title}
            </h1>

            <div className="flex items-center text-gray-600 text-sm mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{berita.date}</span>
              {/* Hapus penulis */}
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden mb-8 h-96">
            <img
              src={berita.cover}
              alt={berita.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: berita.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
