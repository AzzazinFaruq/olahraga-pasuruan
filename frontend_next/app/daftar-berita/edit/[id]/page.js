"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import axiosClient from "@/app/auths/auth-context/axiosClient";
import { getImageURL } from "@/app/utils/config";

const EditNewsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    cover: null,
  });
  const [previewCover, setPreviewCover] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newsRes, setNewsRes] = useState();

  // Simulate data loading for edit page
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosClient.get(`publik/news/${id}`);
        const data = response.data.data;
        setNewsRes(data);
        setFormData({
          title: data.title,
          content: data.content,
          cover: data.cover,
        });
        setPreviewCover(data.cover ? getImageURL(data.cover) : "");
        setLoading(false);
      } catch (err) {
        setNewsRes(null);
      }
    };

    fetchNews();
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

      const newsForm = new FormData();
      newsForm.append("title", formData.title);
      newsForm.append("cover", formData.cover)
      newsForm.append("content", formData.content)
     
      const putNews = axiosClient.put(`api/news/update/${id}`, newsForm )

      // Show success notification
      if(putNews){
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
      }
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
                <div className="grid gap-6">
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