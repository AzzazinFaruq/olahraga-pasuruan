"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosClient from "@/app/auths/auth-context/axiosClient";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import Swal from "sweetalert2";

const EditResultPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    event_name: "",
    medali: "",
    catatan: "",
    nomor_id: "",
    atlet_id: "",
  });

  const [initialFormData, setInitialFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nomors, setNomors] = useState([]);
  const [atlets, setAtlets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dokumentasiList, setDokumentasiList] = useState([]);
  const [newDokumentasiFiles, setNewDokumentasiFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hasilRes, nomorRes, atletRes, dokRes] = await Promise.all([
          axiosClient.get(`api/hasil/${id}`),
          axiosClient.get("publik/nomor"),
          axiosClient.get("publik/atlet"),
          axiosClient.get(`api/dokumentasi/hasil/${id}`),
        ]);

        const hasil = hasilRes.data.data;
        setFormData({
          event_name: hasil.event_name || "",
          medali: hasil.medali || "",
          catatan: hasil.catatan || "",
          nomor_id: hasil.nomor_id || "",
          atlet_id: hasil.atlet_id || "",
        });

        setInitialFormData({
          event_name: hasil.event_name || "",
          medali: hasil.medali || "",
          catatan: hasil.catatan || "",
          nomor_id: hasil.nomor_id || "",
          atlet_id: hasil.atlet_id || "",
        });

        setNomors(nomorRes.data.data || []);
        setAtlets(atletRes.data.data || []);
        setDokumentasiList(dokRes.data.data || []);
      } catch (err) {
        setError("Gagal memuat data hasil pertandingan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDokumentasiChange = (e, index) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB.");
      return;
    }
    const updated = [...newDokumentasiFiles];
    updated[index] = file;
    setNewDokumentasiFiles(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Log data awal dan sekarang (debug)
    console.log("initialFormData:", initialFormData);
    console.log("formData:", formData);

    // Perbandingan eksplisit
    const hasFormChanged =
      initialFormData &&
      (formData.event_name.trim() !==
        (initialFormData.event_name || "").trim() ||
        formData.medali !== initialFormData.medali ||
        String(formData.catatan || "") !==
          String(initialFormData.catatan || "") ||
        String(formData.nomor_id) !== String(initialFormData.nomor_id) ||
        String(formData.atlet_id) !== String(initialFormData.atlet_id));

    const hasDokumentasiChanged = newDokumentasiFiles.some((file) => !!file);

    if (!hasFormChanged && !hasDokumentasiChanged) {
      Swal.fire({
        icon: "info",
        title: "Tidak ada perubahan",
        text: "Anda belum mengubah data apa pun.",
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
      setIsSubmitting(false);
      return;
    }

    try {
      // Kirim perubahan hasil pertandingan
      if (hasFormChanged) {
        const form = new FormData();
        form.append("event_name", formData.event_name);
        form.append("medali", formData.medali);
        form.append("catatan", formData.catatan);
        form.append("nomor_id", formData.nomor_id);
        form.append("atlet_id", formData.atlet_id);

        await axiosClient.put(`api/hasil/update/${id}`, form);
      }

      // Kirim update dokumentasi jika ada file baru
      for (let i = 0; i < dokumentasiList.length; i++) {
        const file = newDokumentasiFiles[i];
        if (!file) continue;

        const docForm = new FormData();
        docForm.append("dokumentasi", file);
        docForm.append("hasil_pertandingan_id", id);

        await axiosClient.put(
          `/api/dokumentasi/${dokumentasiList[i].id}`,
          docForm
        );
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data berhasil diperbarui",
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

      setTimeout(() => router.back(), 1500);
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat memperbarui hasil"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
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

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Event
                </label>
                <input
                  type="text"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Atlet</label>
                <div className="relative">
                  <select
                    name="atlet_id"
                    value={formData.atlet_id}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-gray-300 appearance-none pr-10"
                    required
                  >
                    <option value="">Pilih Atlet</option>
                    {atlets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nama}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nomor Pertandingan
                </label>
                <div className="relative">
                  <select
                    name="nomor_id"
                    value={formData.nomor_id}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-gray-300 appearance-none pr-10"
                    required
                  >
                    <option value="">Pilih Nomor</option>
                    {nomors.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.nama_nomor}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Medali</label>
                <div className="relative">
                  <select
                    name="medali"
                    value={formData.medali}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-gray-300 appearance-none pr-10"
                    required
                  >
                    <option value="">Pilih Medali</option>
                    <option value="Emas">Emas</option>
                    <option value="Perak">Perak</option>
                    <option value="Perunggu">Perunggu</option>
                    <option value="Partisipasi">Partisipasi</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Catatan
                </label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-gray-300"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Dokumentasi
                </label>
                {dokumentasiList.length > 0 ? (
                  dokumentasiList.map((doc, index) => (
                    <div key={doc.id} className="mb-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleDokumentasiChange(e, index)}
                        className="w-full p-2 border rounded"
                      />
                      <div className="text-xs mt-1">
                        File lama:{" "}
                        <a
                          href={`http://localhost:8080/${doc.dokumentasi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Lihat
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada dokumentasi</p>
                )}
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
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditResultPage;
