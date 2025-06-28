"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

const AddAthletePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    photo: null,
    birthPlace: "",
    birthDate: "",
    gender: "",
    address: "",
    school: "",
    parent: "",
    cabangOlahraga: "",
    nomor: "",
  });

  const [preview, setPreview] = useState("");
  const [cabangOlahragaList, setCabangOlahragaList] = useState([]);
  const [nomorList, setNomorList] = useState([]);

  useEffect(() => {
    // Ambil daftar cabor dari backend
    fetch("http://localhost:8080/api/cabor")
      .then((res) => res.json())
      .then((data) => setCabangOlahragaList(data.data || []));
  }, []);

  useEffect(() => {
    if (formData.cabangOlahraga) {
      const selectedCabor = cabangOlahragaList.find(
        (cabor) => cabor.nama_cabor === formData.cabangOlahraga
      );
      if (selectedCabor) {
        fetch(`http://localhost:8080/api/nomor/cabor/${selectedCabor.id}`)
          .then((res) => res.json())
          .then((data) => setNomorList(data.data || []));
      } else {
        setNomorList([]);
      }
    } else {
      setNomorList([]);
    }
  }, [formData.cabangOlahraga, cabangOlahragaList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
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
                {/* Left Column - Photo */}
                <div className="md:w-1/3">
                  <div className="w-full mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Foto Atlet
                    </label>
                    <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-center p-4">
                          No image selected
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-2 w-full p-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                </div>

                {/* Right Column - Form Fields */}
                <div className="md:w-2/3">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300"
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tempat Lahir
                        </label>
                        <input
                          type="text"
                          name="birthPlace"
                          value={formData.birthPlace}
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
                          name="birthDate"
                          value={formData.birthDate}
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
                            name="gender"
                            value={formData.gender}
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
                          Alamat
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300"
                          placeholder="Masukkan alamat"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Sekolah
                        </label>
                        <input
                          type="text"
                          name="school"
                          value={formData.school}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300"
                          placeholder="Masukkan nama sekolah"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Nama Orang Tua/Wali
                        </label>
                        <input
                          type="text"
                          name="parent"
                          value={formData.parent}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-300"
                          placeholder="Masukkan nama orang tua/wali"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Cabang Olahraga
                        </label>
                        <div className="relative">
                          <select
                            name="cabangOlahraga"
                            value={formData.cabangOlahraga}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border border-gray-300 appearance-none"
                            required
                          >
                            <option value="">Pilih Cabang Olahraga</option>
                            {cabangOlahragaList.map((cabor) => (
                              <option key={cabor.id} value={cabor.nama_cabor}>
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

                      <div>
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
                          >
                            <option value="">Pilih Nomor Pertandingan</option>
                            {nomorList.map((nomor) => (
                              <option key={nomor.id} value={nomor.nama_nomor}>
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
                        className="px-4 py-2 rounded-lg text-white"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        Simpan
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
