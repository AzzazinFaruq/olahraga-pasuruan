"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import axios from "axios";

const AthletesPage = () => {
  const [nomorList, setNomorList] = useState([]);
  const [cabangOlahragaList, setCabangOlahragaList] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCabor, setFilterCabor] = useState("");
  const [filterNomor, setFilterNomor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const athletesPerPage = 9;

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/atlet")
      .then((res) => {
        setAthletes(res.data.data);
      })
      .catch((err) => {
        console.error("Gagal ambil data:", err);
      });

    axios
      .get("http://localhost:8080/api/cabor")
      .then((res) => {
        setCabangOlahragaList(res.data.data);
      })
      .catch((err) => {
        console.error("Gagal ambil data:", err);
      });
  }, []);

  useEffect(() => {
    if (filterCabor) {
      // Cari id cabor dari nama_cabor
      const selectedCabor = cabangOlahragaList.find(
        (cabor) => cabor.nama_cabor === filterCabor
      );
      if (selectedCabor) {
        axios
          .get(`http://localhost:8080/api/nomor/cabor/${selectedCabor.id}`)
          .then((res) => {
            setNomorList(res.data.data);
          })
          .catch((err) => {
            setNomorList([]);
            console.error("Gagal ambil data nomor:", err);
          });
      } else {
        setNomorList([]);
      }
    } else {
      setNomorList([]);
    }
  }, [filterCabor, cabangOlahragaList]);

  const uniqueNomors = useMemo(() => nomorList, [nomorList]);

  const filteredAthletes = useMemo(() => {
    return athletes.filter((athlete) => {
      const matchesCabor =
        filterCabor === "" || athlete.cabor?.nama_cabor === filterCabor;
      const matchesNomor =
        filterNomor === "" || athlete.nomor?.nama_nomor === filterNomor;
      const matchesSearch =
        searchQuery === "" ||
        athlete.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        athlete.cabor?.nama_cabor
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (athlete.nomor &&
          athlete.nomor.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCabor && matchesNomor && matchesSearch;
    });
  }, [filterCabor, filterNomor, searchQuery, athletes]);

  // Pagination
  const indexOfLastAthlete = currentPage * athletesPerPage;
  const indexOfFirstAthlete = indexOfLastAthlete - athletesPerPage;
  const currentAthletes = filteredAthletes.slice(
    indexOfFirstAthlete,
    indexOfLastAthlete
  );
  const totalPages = Math.ceil(filteredAthletes.length / athletesPerPage);

  const handleFilterCaborChange = (e) => {
    setFilterCabor(e.target.value);
    setFilterNomor("");
    setCurrentPage(1);
  };

  const handleFilterNomorChange = (e) => {
    setFilterNomor(e.target.value);
    setCurrentPage(1);
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
        <h1
          className="text-center mb-8"
          style={{
            fontSize: "var(--font-size-xlarge)",
            fontWeight: "bold",
            color: "var(--color-primary)",
          }}
        >
          DAFTAR ATLET
        </h1>

        {/* Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start justify-center">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari atlet..."
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
            href="/daftar-atlet/form"
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
            Tambah Atlet
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentAthletes.length > 0 ? (
            currentAthletes.map((athlete) => (
              <Link key={athlete.id} href={`/daftar-atlet/${athlete.id}`}>
                <div
                  className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                  style={{
                    border: "1px solid var(--color-gray-200)",
                  }}
                >
                  <div className="flex items-center p-4">
                    <div
                      className="w-20 h-20 rounded-full overflow-hidden mr-4"
                      style={{
                        backgroundColor: "var(--color-gray-100)",
                      }}
                    >
                      <img
                        src={`http://localhost:8080/${athlete.foto_3x4}`}
                        alt={athlete.foto_bebas}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3
                        className="font-semibold"
                        style={{
                          fontSize: "var(--font-size-medium)",
                          color: "var(--color-gray-800)",
                        }}
                      >
                        {athlete.nama}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-gray-600)" }}
                      >
                        {athlete.sport}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p>Tidak ada atlet yang ditemukan</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredAthletes.length > athletesPerPage && (
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

export default AthletesPage;
