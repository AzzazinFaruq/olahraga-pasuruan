"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const ResultsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCabor, setFilterCabor] = useState("");
  const [filterNomor, setFilterNomor] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newResult, setNewResult] = useState({
    cabor: "",
    nomor: "",
    atlet: [{ id: "", posisi: "" }],
  });

  // State for API data
  const [allResults, setAllResults] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [cabors, setCabors] = useState([]);
  const [nomors, setNomors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resultsPerPage = 10;

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resultsRes, athletesRes, caborsRes, nomorsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/hasil'),
          axios.get('http://localhost:8080/api/atlet'),
          axios.get('http://localhost:8080/api/cabor'),
          axios.get('http://localhost:8080/api/nomor')
        ]);

        setAllResults(resultsRes.data.data || []);
        setAthletes(athletesRes.data.data || []);
        setCabors(caborsRes.data.data || []);
        setNomors(nomorsRes.data.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data');
        // Fallback to static data if API fails
        setAllResults([
          {
            id: 1,
            nomor: { nama_nomor: "Individual Hyung PUTRI", cabor: { nama_cabor: "HAPKIDO" } },
            atlet: { nama: "Siti Rahmawati" },
            medali: "Emas",
            created_at: "2025-06-16T00:00:00Z",
          },
          {
            id: 2,
            nomor: { nama_nomor: "Individual Hyung PUTRI", cabor: { nama_cabor: "HAPKIDO" } },
            atlet: { nama: "Ahmad Fauzi" },
            medali: "Perak",
            created_at: "2025-06-16T00:00:00Z",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMedal = (medali) => {
    return medali || "Partisipasi";
  };

  const getUniqueValues = (key) => [
    ...new Set(allResults.map((item) => {
      if (key === "cabangOlahraga") return item.nomor?.cabor?.nama_cabor;
      if (key === "nomor") return item.nomor?.nama_nomor;
      return item[key];
    }).filter(Boolean)),
  ];

  const uniqueCabors = useMemo(() => getUniqueValues("cabangOlahraga"), [allResults]);
  const allUniqueNomors = useMemo(() => getUniqueValues("nomor"), [allResults]);
  const uniqueNomors = useMemo(() => {
    if (!filterCabor) return [];
    return [
      ...new Set(
        allResults
          .filter((item) => item.nomor?.cabor?.nama_cabor === filterCabor)
          .map((item) => item.nomor?.nama_nomor)
          .filter(Boolean)
      ),
    ];
  }, [filterCabor, allResults]);

  const filteredResults = useMemo(() => {
    return allResults.filter((result) => {
      const matchesCabor =
        filterCabor === "" || result.nomor?.cabor?.nama_cabor === filterCabor;
      const matchesNomor = filterNomor === "" || result.nomor?.nama_nomor === filterNomor;
      const matchesSearch =
        searchQuery === "" ||
        result.nomor?.cabor?.nama_cabor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.nomor?.nama_nomor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getMedal(result.medali).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCabor && matchesNomor && matchesSearch;
    });
  }, [filterCabor, filterNomor, searchQuery, allResults]);

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(
    indexOfFirstResult,
    indexOfLastResult
  );
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  const handleFilterCaborChange = (e) => {
    setFilterCabor(e.target.value);
    setFilterNomor("");
    setCurrentPage(1);
  };

  const handleFilterNomorChange = (e) => {
    setFilterNomor(e.target.value);
    setCurrentPage(1);
  };

  const addAthlete = () => {
    setNewResult((prev) => ({
      ...prev,
      atlet: [...prev.atlet, { id: "", posisi: "" }],
    }));
  };

  const removeAthlete = (index) => {
    if (newResult.atlet.length <= 1) return;
    setNewResult((prev) => {
      const updatedAtlet = [...prev.atlet];
      updatedAtlet.splice(index, 1);
      return { ...prev, atlet: updatedAtlet };
    });
  };

  const handleAthleteChange = (index, field, value) => {
    const updatedAtlet = [...newResult.atlet];
    updatedAtlet[index][field] = value;
    setNewResult((prev) => ({
      ...prev,
      atlet: updatedAtlet,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Memuat data...</p>
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
        <h1
          className="text-center mb-8"
          style={{
            fontSize: "var(--font-size-xlarge)",
            fontWeight: "bold",
            color: "var(--color-primary)",
          }}
        >
          HASIL PERTANDINGAN
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <select
                value={filterCabor}
                onChange={handleFilterCaborChange}
                className="w-full p-3 rounded-lg border appearance-none"
                style={{
                  borderColor: "var(--color-gray-300)",
                  backgroundColor: "var(--color-white)",
                }}
              >
                <option value="">Semua Cabang Olahraga</option>
                {uniqueCabors.map((cabor, index) => (
                  <option key={index} value={cabor}>
                    {cabor}
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

            <div className="flex-1 relative">
              <select
                value={filterNomor}
                onChange={handleFilterNomorChange}
                className="w-full p-3 rounded-lg border appearance-none"
                style={{
                  borderColor: "var(--color-gray-300)",
                  backgroundColor: "var(--color-white)",
                }}
                disabled={!filterCabor}
              >
                <option value="">Semua Nomor Pertandingan</option>
                {uniqueNomors.map((nomor, index) => (
                  <option key={index} value={nomor}>
                    {nomor}
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

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Cari hasil pertandingan..."
              className="w-full p-3 rounded-lg border"
              style={{
                borderColor: "var(--color-gray-300)",
                backgroundColor: "var(--color-white)",
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-3 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "white",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Hasil Pertandingan
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl">
              <div className="p-6">
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--color-gray-700)" }}
                  >
                    Cabang Olahraga
                  </label>
                  <input
                    list="cabor-list"
                    value={newResult.cabor}
                    onInput={(e) => {
                      const value = e.target.value;
                      if (uniqueCabors.includes(value)) {
                        e.target.blur();
                      }
                    }}
                    onChange={(e) =>
                      setNewResult({ ...newResult, cabor: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border"
                    style={{
                      borderColor: "var(--color-gray-300)",
                    }}
                    placeholder="Masukkan cabang olahraga"
                  />
                  <datalist id="cabor-list">
                    {uniqueCabors.map((cabor, index) => (
                      <option key={index} value={cabor} />
                    ))}
                  </datalist>
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--color-gray-700)" }}
                  >
                    Nomor Pertandingan
                  </label>
                  <input
                    list="nomor-list"
                    value={newResult.nomor}
                    onInput={(e) => {
                      const value = e.target.value;
                      if (allUniqueNomors.includes(value)) {
                        e.target.blur(); 
                      }
                    }}
                    onChange={(e) =>
                      setNewResult({ ...newResult, nomor: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border"
                    style={{
                      borderColor: "var(--color-gray-300)",
                    }}
                    placeholder="Masukkan nomor pertandingan"
                  />
                  <datalist id="nomor-list">
                    {allUniqueNomors.map((nomor, index) => (
                      <option key={index} value={nomor} />
                    ))}
                  </datalist>
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--color-gray-700)" }}
                  >
                    Atlet
                  </label>
                  {newResult.atlet.map((athlete, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                      <div className="flex-1 relative">
                        <select
                          value={athlete.id}
                          onChange={(e) =>
                            handleAthleteChange(index, "id", e.target.value)
                          }
                          className="w-full p-3 rounded-lg border pr-10 appearance-none"
                          style={{
                            borderColor: "var(--color-gray-300)",
                          }}
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
                      <input
                        type="number"
                        min="1"
                        value={athlete.posisi}
                        onChange={(e) =>
                          handleAthleteChange(index, "posisi", e.target.value)
                        }
                        className="w-40 p-3 rounded-lg border"
                        style={{
                          borderColor: "var(--color-gray-300)",
                        }}
                        placeholder="Posisi"
                      />
                      {newResult.atlet.length > 1 && (
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
                    className="flex items-center gap-1 text-sm mt-2"
                    style={{ color: "var(--color-primary)" }}
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

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border"
                    style={{
                      borderColor: "var(--color-gray-300)",
                    }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      console.log("New result:", newResult);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg shadow-lg mb-8">
          <table
            className="w-full"
            style={{
              borderCollapse: "collapse",
              backgroundColor: "var(--color-white)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "var(--color-gray-100)" }}>
                <th
                  className="p-4 text-left"
                  style={{ borderBottom: "1px solid var(--color-gray-200)" }}
                >
                  Cabang Olahraga
                </th>
                <th
                  className="p-4 text-left"
                  style={{ borderBottom: "1px solid var(--color-gray-200)" }}
                >
                  Nomor
                </th>
                <th
                  className="p-4 text-left"
                  style={{ borderBottom: "1px solid var(--color-gray-200)" }}
                >
                  Atlet
                </th>
                <th
                  className="p-4 text-left"
                  style={{ borderBottom: "1px solid var(--color-gray-200)" }}
                >
                  Medali
                </th>
                <th
                  className="p-4 text-left"
                  style={{ borderBottom: "1px solid var(--color-gray-200)" }}
                >
                  Tanggal
                </th>
                <th
                  className="p-4 text-left"
                  style={{ borderBottom: "1px solid var(--color-gray-200)" }}
                ></th>
              </tr>
            </thead>
            <tbody>
              {currentResults.map((result) => (
                <tr
                  key={result.id}
                  style={{ borderBottom: "1px solid var(--color-gray-200)" }}
                >
                  <td className="p-4">{result.nomor?.cabor?.nama_cabor || "N/A"}</td>
                  <td className="p-4">{result.nomor?.nama_nomor || "N/A"}</td>
                  <td className="p-4">{result.atlet?.nama || "N/A"}</td>
                  <td className="p-4">
                    {result.medali && (
                      <span
                        className={`px-2 py-1 rounded-full ${
                          result.medali === "Emas"
                            ? "bg-yellow-100 text-yellow-800"
                            : result.medali === "Perak"
                            ? "bg-gray-100 text-gray-800"
                            : result.medali === "Perunggu"
                            ? "bg-yellow-700 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {getMedal(result.medali)}
                      </span>
                    )}
                  </td>
                  <td className="p-4">{formatDate(result.created_at)}</td>
                  <td className="p-4">
                    <Link href={`/hasil-pertandingan/${result.id}`}>
                      <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="var(--color-primary)"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Tidak ada data hasil pertandingan</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md"
              style={{
                backgroundColor:
                  currentPage === 1
                    ? "var(--color-gray-200)"
                    : "var(--color-primary)",
                color: currentPage === 1 ? "var(--color-gray-600)" : "white",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === page ? "font-bold" : ""
                }`}
                style={{
                  backgroundColor:
                    currentPage === page
                      ? "var(--color-primary)"
                      : "var(--color-gray-100)",
                  color: currentPage === page ? "white" : "var(--color-gray-800)",
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md"
              style={{
                backgroundColor:
                  currentPage === totalPages
                    ? "var(--color-gray-200)"
                    : "var(--color-primary)",
                color:
                  currentPage === totalPages ? "var(--color-gray-600)" : "white",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ResultsPage;