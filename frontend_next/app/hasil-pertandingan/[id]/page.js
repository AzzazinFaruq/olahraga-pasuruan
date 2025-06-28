"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

const ResultDetail = ({ params: paramsPromise }) => {
  const params = React.use(paramsPromise);
  const resultId = params.id;

  const [result, setResult] = useState(null);
  const [relatedAthletes, setRelatedAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get medal priority
  const getMedalPriority = (medal) => {
    switch (medal) {
      case "Emas":
        return 1;
      case "Perak":
        return 2;
      case "Perunggu":
        return 3;
      default:
        return 4;
    }
  };

  useEffect(() => {
    const fetchResultDetail = async () => {
      try {
        setLoading(true);

        // Fetch main result
        const response = await axios.get(
          `http://localhost:8080/api/hasil/${resultId}`
        );
        const mainResult = response.data.data;
        setResult(mainResult);

        // Fetch all athletes in the same event, cabor, and nomor
        if (mainResult) {
          const eventName = mainResult.event_name;
          const caborId = mainResult.nomor?.cabor?.id;
          const nomorId = mainResult.nomor_id;

          if (eventName && caborId && nomorId) {
            // First get all results for this nomor
            const nomorResultsResponse = await axios.get(
              `http://localhost:8080/api/hasil/nomor/${nomorId}`
            );

            // Then filter for this specific event and cabor
            const filteredResults = nomorResultsResponse.data.data.filter(
              (result) =>
                result.event_name === eventName &&
                result.nomor?.cabor?.id === caborId
            );

            // Process to get highest medal for each athlete
            const athleteMedals = new Map();

            filteredResults.forEach((result) => {
              const athleteId = result.atlet.id;
              const currentMedal = result.medali;
              const currentPriority = getMedalPriority(currentMedal);

              if (!athleteMedals.has(athleteId)) {
                athleteMedals.set(athleteId, result);
              } else {
                const existingResult = athleteMedals.get(athleteId);
                const existingPriority = getMedalPriority(
                  existingResult.medali
                );

                if (currentPriority < existingPriority) {
                  athleteMedals.set(athleteId, result);
                }
              }
            });

            // Convert to array and sort by medal priority
            const sortedAthletes = Array.from(athleteMedals.values()).sort(
              (a, b) => getMedalPriority(a.medali) - getMedalPriority(b.medali)
            );

            setRelatedAthletes(sortedAthletes);
          }
        }
      } catch (err) {
        console.error("Error fetching result detail:", err);
        setError("Gagal memuat detail hasil pertandingan");
        const staticResult = {
          id: parseInt(resultId),
          nomor: {
            id: 1,
            nama_nomor: "Individual Hyung PUTRI",
            cabor: { id: 1, nama_cabor: "HAPKIDO" },
          },
          atlet: { id: 1, nama: "Siti Rahmawati", nik: "1234567890" },
          medali: "Emas",
          event_name: "Porprov Pasuruan 2025",
          catatan: "Rekor baru cabang renang",
          created_at: "2025-06-16T00:00:00Z",
          nomor_id: 1,
        };
        setResult(staticResult);
        setRelatedAthletes([
          {
            id: 1,
            atlet: { id: 1, nama: "Siti Rahmawati", nik: "1234567890" },
            medali: "Emas",
            created_at: "2025-06-16T00:00:00Z",
          },
          {
            id: 2,
            atlet: { id: 2, nama: "Ahmad Fauzi", nik: "0987654321" },
            medali: "Perak",
            created_at: "2025-06-16T00:00:00Z",
          },
          {
            id: 3,
            atlet: { id: 3, nama: "Budi Santoso", nik: "1122334455" },
            medali: "Perunggu",
            created_at: "2025-06-16T00:00:00Z",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResultDetail();
  }, [resultId]);

  const galleryImages = [
    { id: 1, alt: "Pertandingan Hapkido" },
    { id: 2, alt: "Latihan Hapkido" },
    { id: 3, alt: "Penyerahan Medali" },
    { id: 4, alt: "Pose Atlet" },
    { id: 5, alt: "Aksi Pertandingan" },
    { id: 6, alt: "Tim Hapkido" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID");
  };

  const getMedalColor = (medali) => {
    switch (medali) {
      case "Emas":
        return "#FFD700";
      case "Perak":
        return "#C0C0C0";
      case "Perunggu":
        return "#CD7F32";
      default:
        return "transparent";
    }
  };

  const getMedalClass = (medali) => {
    switch (medali) {
      case "Emas":
        return "bg-yellow-100 text-yellow-800";
      case "Perak":
        return "bg-gray-100 text-gray-800";
      case "Perunggu":
        return "bg-yellow-700 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  if (loading) {
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
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Memuat detail hasil pertandingan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !result) {
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
              href="/hasil-pertandingan"
              className="inline-block mb-6"
              style={{ color: "var(--color-primary)" }}
            >
              &larr; Kembali
            </Link>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        </main>
        <Footer />
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
            href="/hasil-pertandingan"
            className="inline-block mb-6"
            style={{ color: "var(--color-primary)" }}
          >
            &larr; Kembali
          </Link>

          <div
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            style={{ border: "1px solid var(--color-gray-200)" }}
          >
            <h1
              className="mb-2"
              style={{
                fontSize: "var(--font-size-xlarge)",
                fontWeight: "bold",
                color: "var(--color-black)",
              }}
            >
              {result?.nomor?.cabor?.nama_cabor || "N/A"}
            </h1>
            <h2
              className="mb-6"
              style={{
                fontSize: "var(--font-size-large)",
                color: "var(--color-gray-600)",
              }}
            >
              {result?.nomor?.nama_nomor || "N/A"}
            </h2>
            <p className="mb-4" style={{ color: "var(--color-gray-500)" }}>
              Event: {result?.event_name || "Porprov Pasuruan 2025"}
            </p>
            <p className="mb-8" style={{ color: "var(--color-gray-500)" }}>
              Tanggal: {formatDate(result?.created_at)}
            </p>

            {/* Detail Hasil */}
            <div className="mb-8">
              <h3 className="font-bold mb-4 text-lg text-gray-800">
                Detail Hasil
              </h3>
              <div className="space-y-3">
                {relatedAthletes.map((athleteResult) => (
                  <div
                    key={athleteResult.id}
                    className="flex items-center p-3 rounded-lg gap-3"
                    style={{
                      backgroundColor: "var(--color-gray-100)",
                      borderLeft: `4px solid ${getMedalColor(
                        athleteResult.medali
                      )}`,
                    }}
                  >
                    <div className="w-12 h-12 min-w-[48px] rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                      {athleteResult.atlet?.foto_3x4 ? (
                        <img
                          src={`http://localhost:8080/${athleteResult.atlet.foto_3x4}`}
                          alt={athleteResult.atlet.nama || "Atlet"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-bold text-sm">
                          {athleteResult.atlet?.nama?.charAt(0) || "A"}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">
                        {athleteResult.atlet?.nama || "N/A"}
                      </h3>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full font-bold text-sm whitespace-nowrap ${getMedalClass(
                        athleteResult.medali
                      )}`}
                    >
                      {athleteResult.medali || "Partisipasi"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Catatan */}
            {result?.catatan && (
              <div className="mb-8">
                <h3
                  className="font-bold mb-4"
                  style={{
                    fontSize: "var(--font-size-medium)",
                    color: "var(--color-gray-800)",
                  }}
                >
                  Catatan
                </h3>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p style={{ color: "var(--color-gray-700)" }}>
                    {result.catatan}
                  </p>
                </div>
              </div>
            )}

            {/* Dokumentasi */}
            <div>
              <h2
                className="font-bold mb-6"
                style={{
                  fontSize: "var(--font-size-large)",
                  color: "var(--color-gray-800)",
                }}
              >
                Dokumentasi Pertandingan
              </h2>
              <div
                className="relative w-full overflow-hidden rounded-2xl p-4 mb-4"
                style={{
                  backgroundColor: "var(--color-gray-100)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div className="relative overflow-hidden h-64 rounded-xl">
                  <div className="absolute flex animate-scroll whitespace-nowrap">
                    {galleryImages.map((img) => (
                      <div key={img.id} className="inline-block mx-4">
                        <div
                          className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl w-96 h-56 flex items-center justify-center font-medium shadow-md"
                          style={{ fontSize: "var(--font-size-normal)" }}
                        >
                          {img.alt}
                        </div>
                      </div>
                    ))}
                    {galleryImages.map((img) => (
                      <div key={`copy-${img.id}`} className="inline-block mx-4">
                        <div
                          className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl w-96 h-56 flex items-center justify-center font-medium shadow-md"
                          style={{ fontSize: "var(--font-size-normal)" }}
                        >
                          {img.alt}
                        </div>
                      </div>
                    ))}
                  </div>
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

export default ResultDetail;
