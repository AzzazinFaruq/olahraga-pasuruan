"use client";

import React, { useState, useMemo, useEffect } from "react";
import axiosClient from "../auths/auth-context/axiosClient";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Filter from "../components/filter";
import Table from "../components/table";
import Link from "next/link";

const ResultsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCabor, setFilterCabor] = useState("");
  const [filterNomor, setFilterNomor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // State for API data
  const [allResults, setAllResults] = useState([]);
  const [cabors, setCabors] = useState([]);
  const [nomors, setNomors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resultsPerPage = 10;

  // Medal priority for sorting
  const medalPriority = {
    Emas: 1,
    Perak: 2,
    Perunggu: 3,
    Partisipasi: 4,
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resultsRes, caborsRes, nomorsRes] = await Promise.all([
          axiosClient.get("api/hasil"),
          axiosClient.get("api/cabor"),
          axiosClient.get("api/nomor"),
        ]);

        setAllResults(resultsRes.data.data || []);
        setCabors(caborsRes.data.data || []);
        setNomors(nomorsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMedal = (medali) => {
    return medali || "Partisipasi";
  };

  const filteredResults = useMemo(() => {
    const groupedResults = {};
    allResults.forEach((result) => {
      // Skip PORPROV JATIM XI
      if (result.event_name === "PORPROV JATIM XI") return;

      const key = `${result.event_name}-${result.nomor?.cabor?.id}-${result.nomor?.id}`;

      if (!groupedResults[key]) {
        groupedResults[key] = [];
      }

      groupedResults[key].push(result);
    });

    const bestResults = Object.values(groupedResults).map((group) => {
      return group.sort(
        (a, b) => medalPriority[a.medali] - medalPriority[b.medali]
      )[0];
    });

    return bestResults.filter((result) => {
      const matchesCabor =
        filterCabor === "" || result.nomor?.cabor?.nama_cabor === filterCabor;
      const matchesNomor =
        filterNomor === "" || result.nomor?.nama_nomor === filterNomor;
      const matchesSearch =
        searchQuery === "" ||
        result.nomor?.cabor?.nama_cabor
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        result.nomor?.nama_nomor
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        getMedal(result.medali)
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        result.event_name?.toLowerCase().includes(searchQuery.toLowerCase());

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID");
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

        <div className="mb-8 flex flex-col gap-4">
          <Filter
            filterCabor={filterCabor}
            handleFilterCaborChange={handleFilterCaborChange}
            filterNomor={filterNomor}
            handleFilterNomorChange={handleFilterNomorChange}
            cabors={cabors}
            nomors={nomors}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full">
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

            <Link
              href="/hasil-pertandingan/form"
              className="px-4 py-3 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
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
              Tambah Hasil
            </Link>
          </div>
        </div>

        <Table
          currentResults={currentResults}
          getMedal={getMedal}
          formatDate={formatDate}
          hideEventColumn={false}
        />

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
                  color:
                    currentPage === page ? "white" : "var(--color-gray-800)",
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
                  currentPage === totalPages
                    ? "var(--color-gray-600)"
                    : "white",
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