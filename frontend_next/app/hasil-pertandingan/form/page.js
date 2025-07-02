"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import axiosClient from "@/app/auths/auth-context/axiosClient";
import { useRouter } from "next/navigation";

const AddResultPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    eventName: "",
    cabor: "",
    nomor: "",
    catatan: "",
    atlet: [{ id: "", posisi: "" }],
    dokumentasi: [{ file: null, atletId: "" }],
  });

  const [athletes, setAthletes] = useState([]);
  const [cabors, setCabors] = useState([]);
  const [nomors, setNomors] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [athletesForModal, setAthletesForModal] = useState([]);

  // Fetch data saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil semua data awal
        const [athletesRes, caborsRes, nomorsRes, usersRes] = await Promise.all(
          [
            axiosClient.get("publik/atlet"),
            axiosClient.get("publik/cabor"),
            axiosClient.get("publik/nomor"),
            axiosClient.get("api/user"),
          ]
        );

        setAthletes(athletesRes.data.data || []);
        setCabors(caborsRes.data.data || []);
        setNomors(nomorsRes.data.data || []);
        setUsers(usersRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data");
      }
    };

    fetchData();
  }, []);

  // Ambil atlet sesuai cabor yang dipilih
  useEffect(() => {
    const fetchAthletesForModal = async () => {
      if (!formData.cabor) {
        setAthletesForModal([]);
        return;
      }
      try {
        const res = await axiosClient.get(
          `api/atlet-cabor/cabor/${formData.cabor}`
        );
        setAthletesForModal(res.data.data || []);
      } catch (err) {
        setAthletesForModal([]);
      }
    };
    fetchAthletesForModal();
  }, [formData.cabor]);

  // Filter nomor berdasarkan cabor
  const nomorsForModal = useMemo(() => {
    if (!formData.cabor) return [];
    return nomors.filter((n) => n.cabor_id == formData.cabor);
  }, [formData.cabor, nomors]);

  // Handler untuk perubahan input dasar
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler untuk perubahan data atlet
  const handleAthleteChange = (index, field, value) => {
    const updatedAtlet = [...formData.atlet];
    updatedAtlet[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      atlet: updatedAtlet,
    }));
  };

  // Tambah baris atlet baru
  const addAthlete = () => {
    setFormData((prev) => ({
      ...prev,
      atlet: [...prev.atlet, { id: "", posisi: "" }],
    }));
  };

  // Hapus baris atlet
  const removeAthlete = (index) => {
    if (formData.atlet.length <= 1) return;
    setFormData((prev) => {
      const updatedAtlet = [...prev.atlet];
      updatedAtlet.splice(index, 1);
      return { ...prev, atlet: updatedAtlet };
    });
  };

  // Handler untuk perubahan dokumentasi
  const handleDokumentasiChange = (index, field, value) => {
    const updatedDokumentasi = [...formData.dokumentasi];
    updatedDokumentasi[index][field] = value;
    setFormData((prev) => ({ ...prev, dokumentasi: updatedDokumentasi }));
  };

  // Tambah baris dokumentasi baru
  const addDokumentasi = () => {
    setFormData((prev) => ({
      ...prev,
      dokumentasi: [...prev.dokumentasi, { file: null, atletId: "" }],
    }));
  };

  // Hapus baris dokumentasi
  const removeDokumentasi = (index) => {
    if (formData.dokumentasi.length <= 1) return;
    setFormData((prev) => {
      const updatedDokumentasi = [...prev.dokumentasi];
      updatedDokumentasi.splice(index, 1);
      return { ...prev, dokumentasi: updatedDokumentasi };
    });
  };

  // Handler untuk upload file dokumentasi
  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      handleDokumentasiChange(index, "file", file);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validasi
      if (!formData.cabor || !formData.nomor) {
        setError("Pilih cabang olahraga dan nomor pertandingan");
        return;
      }

      for (const athlete of formData.atlet) {
        if (!athlete.id || !athlete.posisi) {
          setError("Data atlet belum lengkap");
          return;
        }
      }

      // Kirim data ke API
      const promises = formData.atlet.map((athlete) => {
        const formData = new FormData();
        formData.append("atlet_id", athlete.id);
        formData.append("nomor_id", formData.nomor);
        formData.append("event_name", formData.eventName);
        formData.append("medali", athlete.posisi);
        formData.append("catatan", formData.catatan);
        formData.append("user_id", users.Id);

        return axiosClient.post("api/hasil/add", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      });

      await Promise.all(promises);

      // Kirim dokumentasi
      const docPromises = formData.dokumentasi.map((doc) => {
        const docFormData = new FormData();
        docFormData.append("atlet_id", doc.atletId);
        docFormData.append("file", doc.file);
        docFormData.append("event_name", doc.eventName);

        return axiosClient.post("api/dokumentasi/add", docFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      });

      await Promise.all(docPromises);

      alert("Data hasil pertandingan berhasil ditambahkan!");
      router.push("/porprov");
    } catch (err) {
      console.error("Error saving results:", err);
      setError(
        "Gagal menyimpan hasil pertandingan: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Informasi Event */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Nama Event
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-gray-300"
                    placeholder="Masukkan nama event"
                    required
                  />
                </div>

                {/* Cabang Olahraga */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Cabang Olahraga
                  </label>
                  <div className="relative">
                    <select
                      name="cabor"
                      value={formData.cabor}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border border-gray-300 appearance-none"
                      required
                    >
                      <option value="">Pilih Cabang Olahraga</option>
                      {cabors.map((cabor) => (
                        <option key={cabor.id} value={cabor.id}>
                          {cabor.nama_cabor}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4"
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

                {/* Nomor Pertandingan */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Nomor Pertandingan
                  </label>
                  <div className="relative">
                    <select
                      name="nomor"
                      value={formData.nomor}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border border-gray-300 appearance-none"
                      required
                      disabled={!formData.cabor}
                    >
                      <option value="">Pilih Nomor Pertandingan</option>
                      {nomorsForModal.map((nomor) => (
                        <option key={nomor.id} value={nomor.id}>
                          {nomor.nama_nomor}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4"
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

                {/* Catatan */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-gray-300"
                    placeholder="Masukkan catatan tambahan"
                    rows="3"
                  />
                </div>

                {/* Atlet */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Atlet
                  </label>
                  {formData.atlet.map((athlete, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                      <div className="flex-1 relative">
                        <select
                          value={athlete.id}
                          onChange={(e) =>
                            handleAthleteChange(index, "id", e.target.value)
                          }
                          className="w-full p-3 rounded-lg border pr-10 appearance-none border-gray-300"
                          required
                        >
                          <option value="">Pilih Atlet</option>
                          {athletesForModal.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nama}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <svg
                            className="w-4 h-4"
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

                      <div className="relative w-40">
                        <select
                          value={athlete.posisi}
                          onChange={(e) =>
                            handleAthleteChange(index, "posisi", e.target.value)
                          }
                          className="w-full p-3 rounded-lg border appearance-none border-gray-300"
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
                            className="w-4 h-4"
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

                      {formData.atlet.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAthlete(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                          aria-label="Hapus atlet"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAthlete}
                    className="flex items-center gap-1 text-sm mt-2 text-blue-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Tambah Atlet
                  </button>
                </div>

                {/* Dokumentasi */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Dokumentasi
                  </label>
                  {formData.dokumentasi.map((doc, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                      <div className="flex-1">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(index, e)}
                          className="w-full p-2 rounded-lg border border-gray-300"
                          // required
                        />
                      </div>
                      <div className="flex-1 relative">
                        <select
                          value={doc.atletId}
                          onChange={(e) =>
                            handleDokumentasiChange(
                              index,
                              "atletId",
                              e.target.value
                            )
                          }
                          className="w-full p-2 rounded-lg border appearance-none border-gray-300"
                          // required
                        >
                          <option value="">Pilih Atlet</option>
                          {athletes.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nama}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <svg
                            className="w-4 h-4"
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
                      {formData.dokumentasi.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDokumentasi(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                          aria-label="Hapus dokumentasi"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDokumentasi}
                    className="flex items-center gap-1 text-sm mt-2 text-blue-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Tambah Dokumentasi
                  </button>
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end gap-3 pt-4">
                  <Link
                    href="/porprov"
                    className="px-4 py-2 rounded-lg border border-gray-300"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-white disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-primary)" }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Sementara"}
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

export default AddResultPage;
