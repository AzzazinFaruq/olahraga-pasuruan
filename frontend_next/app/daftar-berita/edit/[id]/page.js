"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const EditNewsPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    content: "",
    cover: null,
  });
  const [previewCover, setPreviewCover] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate data loading for edit page
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set sample data for editing
        setFormData({
          title: "Pasuruan Juara Umum PORPROV 2025",
          date: "2025-06-15",
          content: `<p class="mb-4">Kabupaten Pasuruan berhasil menjadi juara umum pada ajang Pekan Olahraga Provinsi (PORPROV) Jawa Timur 2025 yang diselenggarakan di Malang. Kontingen Pasuruan meraih total 294 medali dengan rincian 120 emas, 98 perak, dan 76 perunggu.</p>
          <p class="mb-4">Prestasi ini melampaui target yang ditetapkan oleh KONI Kabupaten Pasuruan dan menjadi yang terbaik sepanjang sejarah keikutsertaan Pasuruan dalam PORPROV. Bupati Pasuruan, H.M. Rusdi Sutejo, menyampaikan apresiasi yang tinggi kepada seluruh atlet, pelatih, dan official yang telah berjuang keras.</p>`,
          cover: null
        });
        
        // Set a sample preview image
        setPreviewCover("/image/berita-1.jpg");
      } catch (err) {
        console.error("Gagal memuat data:", err);
        setError("Terjadi kesalahan saat mengambil data berita.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        cover: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCover(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Simulate API update delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success notification
      Swal.fire({
        icon: "success",
        title: "Sukses!",
        text: "Berita berhasil diperbarui!",
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

      // Redirect after success
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      
      // Show error notification
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat memperbarui berita",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "custom-swal-error-popup",
          icon: "custom-swal-error-icon",
          title: "custom-swal-error-title",
        },
      });
      
      setError("Terjadi kesalahan saat memperbarui berita");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat data berita...</p>
      </div>
    );
  }

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
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-block mb-6 cursor-pointer"
            style={{ color: "var(--color-primary)" }}
          >
            &larr; Kembali
          </button>

          <div
            className="bg-white rounded-2xl shadow-xl p-8"
            style={{ border: "1px solid var(--color-gray-200)" }}
          >
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Foto Cover di atas */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Foto Cover
                  </label>
                  <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                    {previewCover ? (
                      <img
                        src={previewCover}
                        alt="Preview Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-center p-4">
                        Belum ada foto cover
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileCoverChange}
                    className="mt-2 w-full p-2 rounded-lg border border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Kosongkan jika tidak ingin mengubah foto
                  </p>
                </div>

                {error && (
                  <div
                    className="p-3 rounded-lg mb-4"
                    style={{ backgroundColor: "var(--color-error-bg)" }}
                  >
                    <p style={{ color: "var(--color-error)" }}>{error}</p>
                  </div>
                )}

                {/* Grid untuk Judul dan Tanggal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Judul Berita
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300"
                      placeholder="Masukkan judul berita"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Konten Berita
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300 min-h-[300px]"
                    placeholder="Tulis konten berita di sini..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 rounded-lg border border-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-white disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-primary)" }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditNewsPage;