"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import axiosClient from "../../auths/auth-context/axiosClient";
import { useParams, useRouter } from "next/navigation";
import { getImageURL } from "../../utils/config";

const formatTanggal = (dateString) => {
  const options = { day: "numeric", month: "long", year: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", options);
};

const AthleteDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const [athlete, setAthlete] = useState(null);

  useEffect(() => {
    if (!id) return;
    axiosClient
      .get(`publik/atlet-cabor/${id}`)
      .then((res) => {
        setAthlete(res.data.data);
      })
      .catch((err) => {
        console.error("Gagal ambil data:", err);
      });
  }, [id]);

  if (!athlete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                <div className="w-64 h-80 rounded-xl overflow-hidden">
                  <img
                    src={getImageURL(athlete.atlet.foto_3x4)}
                    alt={athlete.atlet.nama}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="md:w-2/3 md:pl-8">
                <h1
                  className="mb-6"
                  style={{
                    fontSize: "var(--font-size-xlarge)",
                    fontWeight: "bold",
                    color: "var(--color-black)",
                  }}
                >
                  {athlete.atlet.nama}
                </h1>

                <div className="space-y-4">
                  <Info
                    label="TTL"
                    value={`${athlete.atlet.tempat_lahir}, ${formatTanggal(
                      athlete.atlet.tanggal_lahir
                    )}`}
                  />
                  <Info label="Jenis Kelamin" value={athlete.atlet.jenis_kelamin} />
                  <Info label="Alamat" value={athlete.atlet.alamat} />
                  <Info label="Sekolah" value={athlete.atlet.nama_sekolah} />
                  <Info label="Nama Orang Tua/Wali" value={athlete.atlet.nama_ortu} />
                  <Info label="Cabang Olahraga" value={athlete.cabor.nama_cabor} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <h2
      className="font-medium"
      style={{
        fontSize: "var(--font-size-regular)",
        color: "var(--color-gray-400)",
      }}
    >
      {label}
    </h2>
    <p>{value}</p>
  </div>
);

export default AthleteDetail;
