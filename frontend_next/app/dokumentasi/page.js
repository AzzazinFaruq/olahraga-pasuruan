"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axiosClient from "../auths/auth-context/axiosClient";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getDocumentURL } from "../utils/config";

const DocumentationPage = () => {
  const [dokumentasiAtlet, setDokumentasiAtlet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchDokumentasi = async () => {
      try {
        const res = await axiosClient.get("publik/dokumentasi");
        setDokumentasiAtlet(res.data.data || []);
      } catch (err) {
        console.error("Gagal ambil dokumentasi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDokumentasi();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dokumentasiAtlet.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dokumentasiAtlet.length / itemsPerPage);

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
          DOKUMENTASI
        </h1>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p>Memuat dokumentasi...</p>
          </div>
        ) : currentItems.length > 0 ? (
          <div className="mb-12 columns-1 sm:columns-2 lg:columns-3 gap-4">
            {currentItems.map((doc) => (
              <div
                key={doc.id}
                className="mb-4 relative rounded-xl overflow-hidden cursor-pointer break-inside-avoid"
                style={{
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  width: "100%",
                }}
              >
                <img
                  src={getDocumentURL(doc.dokumentasi)}
                  alt="Dokumentasi Atlet"
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: "500px" }}
                />
                {doc.hasil_pertandingan && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                    <p className="text-sm font-medium">
                      {doc.hasil_pertandingan.event_name}
                    </p>
                    {doc.hasil_pertandingan.atlet && (
                      <p className="text-xs">
                        {doc.hasil_pertandingan.atlet.nama}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p>Belum ada dokumentasi atlet</p>
          </div>
        )}

        {/* Pagination */}
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

export default DocumentationPage;
