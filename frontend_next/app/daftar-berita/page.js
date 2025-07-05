"use client";

import React, { useState, useEffect} from "react";
import Link from "next/link";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import axiosClient from "../auths/auth-context/axiosClient";
import { getImageURL } from "../utils/config";



const NewsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [news, setNews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const newsPerPage = 6;

  // Data dummy berita

  // Filter berita berdasarkan search query
  const filteredNews = news.filter(
    (news) =>
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        const newsRes = await axiosClient.get("publik/news");
        setNews(newsRes.data.data);
      } catch (err) {
       setNews(null)
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

  // Pagination
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(filteredNews.length / newsPerPage);

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
          DAFTAR BERITA
        </h1>

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start justify-center">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari berita..."
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
              href="/daftar-berita/form"
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
              Tambah Berita
            </Link>
          )}
        </div>

        <div className="mb-12">
          {currentNews.length > 0 ? (
            currentNews.map((news) => (
              <Link
                key={news.id}
                href={`/daftar-berita/${news.id}`}
                className="block mb-10 transform transition-transform duration-200 hover:scale-[1.005]"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="flex flex-col md:flex-row">
                    {/* Gambar berita di sebelah kiri */}
                    <div className="md:w-2/5 p-4">
                      <div className="rounded-xl overflow-hidden aspect-video md:aspect-auto md:h-64">
                        <img
                          src={getImageURL(news.cover)}
                          alt={news.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </div>

                    {/* Konten berita di sebelah kanan */}
                    <div className="md:w-3/5 p-4 md:p-6">
                      <h3 className="font-bold text-xl md:text-2xl mb-3 text-gray-800">
                        {news.title}
                      </h3>
                      
                      <div className="flex items-center text-gray-500 mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
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
                        {new Date(news.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                        {news.excerpt}
                      </p>
                      
                      <div className="flex items-center text-[var(--color-primary)] font-medium">
                        Baca selengkapnya
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <h3 className="text-xl font-medium text-gray-800 mt-4">
                  Tidak ada berita yang ditemukan
                </h3>
                <p className="text-gray-600 mt-2">
                  Coba gunakan kata kunci pencarian yang berbeda
                </p>
              </div>
            </div>
          )}
        </div>

        {filteredNews.length > newsPerPage && (
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
                className={`px-4 py-2 rounded-md ${currentPage === page ? "font-bold" : ""}`}
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

export default NewsPage;