"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import axiosClient from "../../auths/auth-context/axiosClient";
import { useParams, useRouter } from "next/navigation";
import { getImageURL } from "../../utils/config";
import Swal from "sweetalert2";

const formatTanggal = (dateString) => {
  const options = { day: "numeric", month: "long", year: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", options);
};

const AthleteDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const [athlete, setAthlete] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // ✅ Endpoint untuk detail atlet
        const atletRes = await axiosClient.get(`publik/atlet/${id}`);

        // ✅ Endpoint untuk cabor atlet (protected, harus pakai token)
        const caborRes = await axiosClient.get(`publik/atlet-cabor/atlet/${id}`);

        setAthlete({
          atlet: atletRes.data.data,
          cabor: caborRes.data.data[0] || null, // fallback kalau tidak ada cabor
        });
      } catch (err) {
        console.error("Gagal ambil data atlet/cabor:", err);
      }
    };

    const fetchUser = async () => {
      try {
        const userRes = await axiosClient.get("api/user");
        setCurrentUser(userRes.data.data);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("User tidak login atau token invalid:", err);
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };

    fetchData();
    fetchUser();
  }, [id]);

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

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data atlet akan dihapus permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        // Hapus relasi atlet-cabor jika ada
        if (athlete.cabor && athlete.cabor.id) {
          await axiosClient.delete(
            `api/atlet-cabor/remove/${athlete.atlet.id}/${athlete.cabor.id}`
          );
        }

        // Hapus data atlet
        await axiosClient.delete(`api/atlet/delete/${athlete.atlet.id}`);

        Swal.fire("Terhapus!", "Data atlet telah dihapus.", "success");
        router.back();
      } catch (error) {
        Swal.fire("Gagal!", "Gagal menghapus data atlet.", "error");
        console.error("Error deleting athlete:", error);
      }
    }
  };

  const handleEdit = () => {
    router.push(`/daftar-atlet/edit/${id}`);
  };

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
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => router.back()}
                className="inline-block cursor-pointer"
                style={{ color: "var(--color-primary)" }}
              >
                &larr; Kembali
              </button>

              {isLoggedIn && currentUser && currentUser.role !== 2 && (
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
              )}
            </div>

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
                    onError={(e) => {
                      e.target.src = "/placeholder-avatar.png";
                    }}
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
                  <Info
                    label="Jenis Kelamin"
                    value={athlete.atlet.jenis_kelamin}
                  />
                  <Info label="Alamat" value={athlete.atlet.alamat} />
                  <Info label="Sekolah" value={athlete.atlet.nama_sekolah} />
                  <Info
                    label="Nama Orang Tua/Wali"
                    value={athlete.atlet.nama_ortu}
                  />
                  <Info
                    label="Cabang Olahraga"
                    value={athlete.cabor?.nama_cabor || "-"}
                  />
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
