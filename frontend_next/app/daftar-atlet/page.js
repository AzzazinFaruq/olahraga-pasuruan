"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import axiosClient from "../auths/auth-context/axiosClient";
import { getImageURL } from "../utils/config";

const AthletesPage = () => {
  const [athletes, setAthletes] = useState([]);
  const [atletCabors, setAtletCabors] = useState([]);
  const [cabangOlahragaList, setCabangOlahragaList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCabor, setFilterCabor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const athletesPerPage = 9;

  useEffect(() => {
    Promise.all([
      axiosClient.get("publik/atlet"),
      axiosClient.get("publik/atlet-cabor?preload=true"),
      axiosClient.get("publik/cabor"),
    ])
      .then(([atletRes, atletCaborRes, caborRes]) => {
        setAthletes(atletRes.data.data);
        setAtletCabors(atletCaborRes.data.data);
        setCabangOlahragaList(caborRes.data.data);
      })
      .catch((err) => {
        console.error("Gagal ambil data:", err);
      });
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axiosClient.get("api/user");
          setCurrentUser(res.data.data);
          setIsLoggedIn(true);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };
    checkAuth();
  }, []);

  const caborMap = useMemo(() => {
    const map = {};
    cabangOlahragaList.forEach((cabor) => {
      map[cabor.id] = cabor.nama_cabor;
    });
    return map;
  }, [cabangOlahragaList]);

  const athletesWithCabor = useMemo(() => {
    return athletes.map((athlete) => {
      const athleteCabors = atletCabors.filter(
        (ac) => ac.atlet_id === athlete.id
      );

      const caborNames = athleteCabors
        .map((ac) => {
          return (
            ac.cabor?.nama_cabor ||
            ac.Cabor?.nama_cabor ||
            caborMap[ac.cabor_id]
          );
        })
        .filter(Boolean);

      const caborIds = athleteCabors.map((ac) => ac.cabor_id).filter(Boolean);

      return {
        ...athlete,
        caborNames: caborNames.join(", ") || "Belum memiliki cabor",
        caborIds,
      };
    });
  }, [athletes, atletCabors, caborMap]);

  const filteredAthletes = useMemo(() => {
    return athletesWithCabor.filter((athlete) => {
      const matchesCabor =
        filterCabor === "" ||
        (athlete.caborIds && athlete.caborIds.includes(parseInt(filterCabor)));

      const matchesSearch =
        searchQuery === "" ||
        athlete.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        athlete.caborNames.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCabor && matchesSearch;
    });
  }, [athletesWithCabor, filterCabor, searchQuery]);

  const indexOfLastAthlete = currentPage * athletesPerPage;
  const indexOfFirstAthlete = indexOfLastAthlete - athletesPerPage;
  const currentAthletes = filteredAthletes.slice(
    indexOfFirstAthlete,
    indexOfLastAthlete
  );
  const totalPages = Math.ceil(filteredAthletes.length / athletesPerPage);

  const handleFilterCaborChange = (e) => {
    setFilterCabor(e.target.value);
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

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start justify-center">
          <div className="relative w-full">
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
              {cabangOlahragaList.map((cabor) => (
                <option key={cabor.id} value={cabor.id}>
                  {cabor.nama_cabor}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

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

          {isLoggedIn && currentUser && currentUser.role === 1 && (
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
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentAthletes.length > 0 ? (
            currentAthletes.map((athlete) => (
              <Link
                key={athlete.id}
                href={`/daftar-atlet/${athlete.id}`}
                className="block transform transition-transform duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-center p-3 rounded-lg gap-4 h-full bg-white shadow-md transition-shadow duration-300 hover:shadow-lg">
                  <div className="w-12 h-12 min-w-[48px] rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                    {athlete.foto_3x4 ? (
                      <img
                        src={getImageURL(athlete.foto_3x4)}
                        alt={athlete.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-bold text-sm">
                        {athlete.nama?.charAt(0) || "A"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">
                      {athlete.nama}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {athlete.caborNames}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 col-span-3">
              <p>Tidak ada atlet yang ditemukan</p>
            </div>
          )}
        </div>

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
