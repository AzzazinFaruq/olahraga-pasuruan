"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import axiosClient from "@/app/auths/auth-context/axiosClient";
import { getImageURL } from "@/app/utils/config";


const NewsDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const [beritaData, setBerita] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
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
    fetchUser();
    const fetchNews = async () => {
      try {
        const newsRes = await axiosClient.get(`publik/news/${id}`);
        setBerita(newsRes.data.data);
      } catch (err) {
       setBerita(null)
      }
    };
    fetchNews();
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
      text: "Berita akan dihapus permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const deleteApi = axiosClient.delete(`api/news/delete/${id}`)
        if(deleteApi){
          Swal.fire("Terhapus!", "Berita telah dihapus.", "success");
        } 
        router.back();
      } catch (error) {
        Swal.fire("Gagal!", "Gagal menghapus berita.", "error");
        console.error("Error deleting news:", error);
      }
    }
  };

  const handleEdit = () => {
    router.push(`/daftar-berita/edit/${id}`);
  };

  if (!beritaData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Berita tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="inline-block cursor-pointer"
            style={{ color: "var(--color-primary)" }}
          >
            &larr; Kembali
          </button>

          {isLoggedIn && currentUser && currentUser.role === 1 && (
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

        {/* Box untuk konten berita */}
        <div
          className="bg-white rounded-2xl shadow-xl p-8"
          style={{ border: "1px solid var(--color-gray-200)" }}
        >
          <article>
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {beritaData.title}
              </h1>

              <div className="flex items-center text-gray-600 text-sm mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                {new Date(beritaData.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })}
                </span>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden mb-8">
              <img
                src={getImageURL(beritaData.cover)}
                alt={beritaData.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: beritaData.content }}
            />
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
