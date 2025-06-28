"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import axios from "axios";
import { useParams } from "next/navigation";

const AthleteDetail = () => {
  const { id } = useParams();
  const [athlete, setAthlete] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`http://localhost:8080/api/atlet/${id}`)
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
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                <div className="w-64 h-80 rounded-xl overflow-hidden">
                  <img
                    src={athlete.foto_3x4}
                    alt={athlete.foto_bebas}
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
                  {athlete.nama}
                </h1>

                <div className="space-y-4">
                  <Info label="TTL" value={`${athlete.tempat_lahir}, ${athlete.tanggal_lahir}`} />
                  <Info label="Jenis Kelamin" value={athlete.jenis_kelamin} />
                  <Info label="Alamat" value={athlete.alamat} />
                  <Info label="Sekolah" value={athlete.sekolah} />
                  <Info label="Nama Orang Tua/Wali" value={athlete.nama_ortu} />
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
