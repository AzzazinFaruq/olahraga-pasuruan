"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import axiosClient from "../../auths/auth-context/axiosClient";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const AddAthletePage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    alamat: "",
    sekolah: "",
    nama_sekolah: "",
    nama_ortu: "",
    cabor_id: "",
    foto_3x4: null,
    foto_bebas: null,
  });

  const [cabangOlahragaList, setCabangOlahragaList] = useState([]);
  const [preview3x4, setPreview3x4] = useState("");
  const [previewBebas, setPreviewBebas] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check auth first
    const checkAuth = async () => {
      try {
        const userRes = await axiosClient.get("api/user");
        const user = userRes.data.data;
        setCurrentUser(user);
        setIsLoggedIn(true);
        
        // Redirect if not admin (role 1)
        if (user.role !== 1) {
          Swal.fire({
            icon: "error",
            title: "Akses Ditolak",
            text: "Anda tidak memiliki izin untuk mengakses halaman ini",
          });
          router.push("/daftar-atlet");
          return;
        }
      } catch (err) {
        console.error("User tidak login atau token invalid:", err);
        Swal.fire({
          icon: "error",
          title: "Akses Ditolak",
          text: "Silakan login terlebih dahulu",
        });
        router.push("/auths/masuk");
        return;
      }
    };

    // Fetch cabang olahraga data
    const fetchCabangOlahraga = async () => {
      try {
        const response = await axiosClient.get("api/cabor");
        if (response.data.status && response.data.data) {
          setCabangOlahragaList(response.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data cabang olahraga:", err);
        setError("Gagal memuat daftar cabang olahraga");
      }
    };

    checkAuth().then(() => {
      fetchCabangOlahraga();
    });
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFile3x4Change = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        foto_3x4: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview3x4(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileBebasChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        foto_bebas: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewBebas(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const athleteForm = new FormData();
      athleteForm.append("nik", formData.nik);
      athleteForm.append("nama", formData.nama);
      athleteForm.append("tempat_lahir", formData.tempat_lahir);
      athleteForm.append("tanggal_lahir", formData.tanggal_lahir);
      athleteForm.append("jenis_kelamin", formData.jenis_kelamin);
      athleteForm.append("alamat", formData.alamat);
      athleteForm.append("sekolah", formData.sekolah);
      athleteForm.append("nama_sekolah", formData.nama_sekolah);
      athleteForm.append("nama_ortu", formData.nama_ortu);
      if (formData.foto_3x4) athleteForm.append("foto_3x4", formData.foto_3x4);
      if (formData.foto_bebas)
        athleteForm.append("foto_bebas", formData.foto_bebas);

      const athleteRes = await axiosClient.post("api/atlet/add",
        athleteForm
      );

      if (!athleteRes.data.status) {
        throw new Error(athleteRes.data.message || "Gagal menambahkan atlet");
      }

      const newAthleteId = athleteRes.data.data.id;

      // Step 2: Assign cabor if selected
      if (formData.cabor_id) {
        const assignForm = new FormData();
        assignForm.append("atlet_id", newAthleteId);
        assignForm.append("cabor_id", formData.cabor_id);

        const assignRes = await axiosClient.post("api/atlet-cabor/assign",
          assignForm
        );

        if (!assignRes.data.status) {
          throw new Error(
            assignRes.data.message || "Gagal menghubungkan atlet dengan cabor"
          );
        }
      }

      Swal.fire({
        icon: "success",
        title: "Sukses!",
        text: "Atlet berhasil ditambahkan!",
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
        router.push("/daftar-atlet");
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat menambahkan atlet"
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
          <Link
            href="/daftar-atlet"
            className="inline-block mb-6"
            style={{ color: "var(--color-primary)" }}
          >
            &larr; Kembali
          </Link>

          <div
            className="bg-white rounded-2xl shadow-xl p-8"
            style={{ border: "1px solid var(--color-gray-200)" }}
          >
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column - Foto */}
                <div className="md:w-1/3 space-y-6">
                  {/* Foto 3x4 */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Foto 3x4
                    </label>
                    <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                      {preview3x4 ? (
                        <img
                          src={preview3x4}
                          alt="Preview 3x4"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-center p-4">
                          Belum ada foto 3x4
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFile3x4Change}
                      className="mt-2 w-full p-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>

                  {/* Foto Bebas */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Foto Bebas
                    </label>
                    <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                      {previewBebas ? (
                        <img
                          src={previewBebas}
                          alt="Preview Bebas"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-center p-4">
                          Belum ada foto bebas
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileBebasChange}
                      className="mt-2 w-full p-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                </div>

                {/* Right Column - Form Data */}
                <div className="md:w-2/3">
                  <div className="space-y-6">
                    {error && (
                      <div
                        className="p-3 rounded-lg mb-4"
                        style={{ backgroundColor: "var(--color-error-bg)" }}
                      >
                        <p style={{ color: "var(--color-error)" }}>{error}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        NIK (16 digit)
                      </label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300"
                        placeholder="Masukkan NIK"
                        required
                        maxLength={16}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300"
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nama Orang Tua/Wali
                      </label>
                      <input
                        type="text"
                        name="nama_ortu"
                        value={formData.nama_ortu}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300"
                        placeholder="Masukkan nama orang tua/wali"
                        required
                      />
                    </div>

                    {/* Cabang Olahraga Dropdown */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Cabang Olahraga
                      </label>
                      <div className="relative">
                        <select
                          name="cabor_id"
                          value={formData.cabor_id}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg border border-gray-300 appearance-none"
                          required
                        >
                          <option value="">Pilih Cabang Olahraga</option>
                          {cabangOlahragaList.map((cabor) => (
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tempat Lahir
                        </label>
                        <input
                          type="text"
                          name="tempat_lahir"
                          value={formData.tempat_lahir}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300"
                          placeholder="Masukkan tempat lahir"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tanggal Lahir
                        </label>
                        <input
                          type="date"
                          name="tanggal_lahir"
                          value={formData.tanggal_lahir}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg border border-gray-300"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Jenis Kelamin
                        </label>
                        <div className="relative">
                          <select
                            name="jenis_kelamin"
                            value={formData.jenis_kelamin}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border border-gray-300 appearance-none"
                            required
                          >
                            <option value="">Pilih Jenis Kelamin</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
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

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Alamat Lengkap
                        </label>
                        <input
                          type="text"
                          name="alamat"
                          value={formData.alamat}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300"
                          placeholder="Masukkan alamat lengkap"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Jenjang Pendidikan
                        </label>
                        <div className="relative">
                          <select
                            name="sekolah"
                            value={formData.sekolah}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border border-gray-300 appearance-none"
                            required
                          >
                            <option value="">Pilih Jenjang</option>
                            <option value="SD">SD</option>
                            <option value="SMP">SMP</option>
                            <option value="SMA">SMA</option>
                            <option value="SMK">SMK</option>
                            <option value="Universitas">Universitas</option>
                            <option value="Lainnya">Lainnya</option>
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

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Nama Sekolah/Institusi
                        </label>
                        <input
                          type="text"
                          name="nama_sekolah"
                          value={formData.nama_sekolah}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300"
                          placeholder="Masukkan nama sekolah/institusi"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Link
                        href="/daftar-atlet"
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
                        {isSubmitting ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </div>
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

export default AddAthletePage;
