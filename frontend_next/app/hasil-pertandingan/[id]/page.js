"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import axiosClient from "../../auths/auth-context/axiosClient";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { getImageURL } from "../../utils/config";
import Swal from "sweetalert2";

const ResultDetail = () => {
  const { id: resultId } = useParams();
  const router = useRouter();

  const [result, setResult] = useState(null);
  const [relatedAthletes, setRelatedAthletes] = useState([]);
  const [dokumentasiItems, setDokumentasiItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

        const response = await axiosClient.get(`publik/hasil/${resultId}`);
        const mainResult = response.data.data;
        setResult(mainResult);

        if (mainResult) {
          const eventName = mainResult.event_name;
          const caborId = mainResult.nomor?.cabor?.id;
          const nomorId = mainResult.nomor_id;

          if (eventName && caborId && nomorId) {
            const nomorResultsResponse = await axiosClient.get(
              `api/hasil/nomor/${nomorId}`
            );

            const filteredResults = nomorResultsResponse.data.data.filter(
              (result) =>
                result.event_name === eventName &&
                result.nomor?.cabor?.id === caborId
            );

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

            const sortedAthletes = Array.from(athleteMedals.values()).sort(
              (a, b) => getMedalPriority(a.medali) - getMedalPriority(b.medali)
            );

            setRelatedAthletes(sortedAthletes);
          }

          if (mainResult.id) {
            const dokumentasiRes = await axiosClient.get(
              `api/dokumentasi/hasil/${mainResult.id}`
            );
            setDokumentasiItems(dokumentasiRes.data.data || []);
          }
        }
      } catch (err) {
        console.error("Error fetching result detail:", err);
        setError("Gagal memuat detail hasil pertandingan");
      } finally {
        setLoading(false);
      }
    };

    fetchResultDetail();
  }, [resultId]);

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

  const id = result?.id;

  const handleDelete = async () => {
    const resultConfirm = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data atlet akan dihapus permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (resultConfirm.isConfirmed) {
      try {
        await axiosClient.delete(`api/hasil/delete/${id}`);
        Swal.fire("Terhapus!", "Data hasil telah dihapus.", "success");
        router.back();
      } catch (error) {
        Swal.fire("Gagal!", "Gagal menghapus data atlet.", "error");
        console.error("Error deleting athlete:", error);
      }
    }
  };

  const handleEdit = () => {
    router.push(`/hasil-pertandingan/edit/${id}`);
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
            <button
              onClick={() => router.back()}
              className="inline-block cursor-pointer"
              style={{ color: "var(--color-primary)" }}
            >
              &larr; Kembali
            </button>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
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
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.back()}
              className="inline-block cursor-pointer"
              style={{ color: "var(--color-primary)" }}
            >
              &larr; Kembali
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                className="px-4 py-2 border rounded-md transition text-[color:var(--color-primary)] border-[color:var(--color-primary)] hover:bg-red-50"
              >
                Hapus
              </button>

              <button
                onClick={handleEdit}
                className="px-4 py-2 rounded-md transition text-white bg-[color:var(--color-primary)] hover:opacity-90"
              >
                Edit
              </button>
            </div>
          </div>

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

            <div className="flex flex-wrap gap-x-4 mb-8">
              <p style={{ color: "var(--color-gray-500)" }}>
                Event: {result?.event_name || "Porprov Pasuruan 2025"}
              </p>
              <p style={{ color: "var(--color-gray-500)" }}>
                Tanggal: {formatDate(result?.created_at)}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="font-bold mb-4 text-lg text-gray-800">
                Detail Hasil
              </h3>
              <div className="space-y-3">
                {relatedAthletes.map((athleteResult) => (
                  <Link
                    key={athleteResult.id}
                    href={`/daftar-atlet/${athleteResult.atlet.id}`}
                    className="block transform transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <div
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
                            src={getImageURL(athleteResult.atlet.foto_3x4)}
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
                  </Link>
                ))}
              </div>
            </div>

            {result?.catatan && (
              <div className="mb-8">
                <h3 className="font-bold mb-4 text-gray-800">Catatan</h3>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p style={{ color: "var(--color-gray-700)" }}>
                    {result.catatan}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold mb-4 text-gray-800">Dokumentasi</h3>
              {dokumentasiItems.length === 0 ? (
                <p className="text-gray-500 py-4">Belum ada dokumentasi</p>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                  {dokumentasiItems.map((item) => (
                    <div
                      key={item.id}
                      className="mb-4 relative rounded-xl overflow-hidden cursor-pointer break-inside-avoid"
                    >
                      <img
                        src={getImageURL(item.dokumentasi)}
                        alt="Dokumentasi"
                        className="w-full rounded-xl shadow-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResultDetail;
