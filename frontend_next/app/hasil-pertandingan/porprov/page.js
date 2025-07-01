"use client";

import React, { useState, useMemo, useEffect } from "react";
import axiosClient from "../../auths/auth-context/axiosClient";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Filter from "../../components/filter";
import Table from "../../components/table";
import Modal from "../../components/modal";

const PorprovPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCabor, setFilterCabor] = useState("");
  const [filterNomor, setFilterNomor] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newResult, setNewResult] = useState({
    eventName: "PORPROV JATIM XI",
    cabor: "",
    nomor: "",
    catatan: "",
    atlet: [{ id: "", posisi: "" }],
    dokumentasi: [{ file: null, atletId: "" }],
  });

  // State for API data
  const [allResults, setAllResults] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [cabors, setCabors] = useState([]);
  const [nomors, setNomors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [athletesForModal, setAthletesForModal] = useState([]);

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
        // Ambil semua data awal
        const [athletesRes, resultsRes, caborsRes, nomorsRes] =
          await Promise.all([
            axiosClient.get("publik/atlet"),
            axiosClient.get("publik/hasil"),
            axiosClient.get("publik/cabor"),
            axiosClient.get("publik/nomor"),
          ]);

        // Filter hanya data dengan event_name "PORPROV JATIM XI"
        const porprovResults = (resultsRes.data.data || []).filter(
          (result) => result.event_name === "PORPROV JATIM XI"
        );

        setAllResults(porprovResults);
        setAthletes(athletesRes.data.data || []);
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

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axiosClient.get("api/user");
      setUsers(res.data.data || []);
    };
    fetchUsers();
  }, []);

  // Ambil atlet sesuai cabor yang dipilih di form modal
  useEffect(() => {
    const fetchAthletesForModal = async () => {
      if (!newResult.cabor) {
        setAthletesForModal([]);
        return;
      }
      try {
        const res = await axiosClient.get(`api/atlet-cabor/cabor/${newResult.cabor}`);
        setAthletesForModal(res.data.data || []);
      } catch (err) {
        setAthletesForModal([]);
      }
    };
    fetchAthletesForModal();
  }, [newResult.cabor]);

  const getMedal = (medali) => {
    return medali || "Partisipasi";
  };

  const filteredResults = useMemo(() => {
    const groupedResults = {};
    allResults.forEach((result) => {
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

  const addDokumentasi = () => {
    setNewResult((prev) => ({
      ...prev,
      dokumentasi: [...prev.dokumentasi, { file: null, atletId: "" }],
    }));
  };

  const removeDokumentasi = (index) => {
    if (newResult.dokumentasi.length <= 1) return;
    setNewResult((prev) => {
      const updatedDokumentasi = [...prev.dokumentasi];
      updatedDokumentasi.splice(index, 1);
      return { ...prev, dokumentasi: updatedDokumentasi };
    });
  };

  const handleDokumentasiChange = (index, field, value) => {
    const updatedDokumentasi = [...newResult.dokumentasi];
    updatedDokumentasi[index][field] = value;
    setNewResult((prev) => ({ ...prev, dokumentasi: updatedDokumentasi }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID");
  };

  const saveResults = async () => {
    try {
      if (!newResult.cabor || !newResult.nomor) {
        setError("Pilih cabang olahraga dan nomor pertandingan");
        return;
      }

      for (const athlete of newResult.atlet) {
        if (!athlete.id || !athlete.posisi) {
          setError("Data atlet belum lengkap");
          return;
        }
      }

      for (const doc of newResult.dokumentasi) {
        if (!doc.file) {
          setError("File dokumentasi wajib diisi");
          return;
        }
      }

      const promises = newResult.atlet.map((athlete) => {
        const formData = new FormData();
        formData.append("atlet_id", athlete.id);
        formData.append("nomor_id", newResult.nomor);
        formData.append("event_name", "PORPROV JATIM XI");
        formData.append("medali", athlete.posisi);
        formData.append("catatan", newResult.catatan);
        formData.append("user_id", users.Id);



        return axiosClient.post("api/hasil/add", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      });

      await Promise.all(promises);

      const resultsRes = await axiosClient.get("api/hasil");
      // Filter lagi hanya data PORPROV JATIM XI
      const porprovResults = (resultsRes.data.data || []).filter(
        (result) => result.event_name === "PORPROV JATIM XI"
      );
      setAllResults(porprovResults);

      setShowModal(false);
      setNewResult({
        eventName: "PORPROV JATIM XI",
        cabor: "",
        nomor: "",
        catatan: "",
        atlet: [{ id: "", posisi: "" }],
        dokumentasi: [{ file: null, atletId: "" }],
      });
      setError(null);
    } catch (err) {
      console.error("Error saving results:", err);
      setError(
        "Gagal menyimpan hasil pertandingan: " +
          (err.response?.data?.message || err.message)
      );
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
          PORPROV JATIM XI
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <Filter
          filterCabor={filterCabor}
          handleFilterCaborChange={handleFilterCaborChange}
          filterNomor={filterNomor}
          handleFilterNomorChange={handleFilterNomorChange}
          cabors={cabors}
          nomors={nomors}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowModal={setShowModal}
        />

        <Table
          currentResults={currentResults}
          getMedal={getMedal}
          formatDate={formatDate}
          hideEventColumn={true}
        />

        <Modal
          showModal={showModal}
          setShowModal={setShowModal}
          newResult={newResult}
          setNewResult={setNewResult}
          athletes={athletesForModal}
          cabors={cabors}
          nomors={nomors}
          saveResults={saveResults}
          error={error}
          setError={setError}
          handleAthleteChange={handleAthleteChange}
          addAthlete={addAthlete}
          removeAthlete={removeAthlete}
          addDokumentasi={addDokumentasi}
          removeDokumentasi={removeDokumentasi}
          handleDokumentasiChange={handleDokumentasiChange}
          fixedEventName={true}
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

export default PorprovPage;