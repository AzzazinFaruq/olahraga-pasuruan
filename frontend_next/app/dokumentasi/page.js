"use client";

import React, { useState } from "react";
import Link from "next/link";
import axiosClient from "../auths/auth-context/axiosClient";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const DocumentationPage = () => {
  const documentationItems = [
    { id: 1, height: 300 },
    { id: 2, height: 450 },
    { id: 3, height: 350 },
    { id: 4, height: 400 },
    { id: 5, height: 250 },
    { id: 6, height: 500 },
    { id: 7, height: 300 },
    { id: 8, height: 400 },
    { id: 9, height: 350 },
    { id: 10, height: 450 },
    { id: 11, height: 300 },
    { id: 12, height: 400 },
    { id: 13, height: 350 },
    { id: 14, height: 300 },
    { id: 15, height: 450 },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = documentationItems.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(documentationItems.length / itemsPerPage);

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
        <div className="mb-12 columns-1 sm:columns-2 lg:columns-3 gap-4">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="mb-4 relative rounded-xl overflow-hidden cursor-pointer break-inside-avoid"
              style={{
                height: `${item.height}px`,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                width: "100%",
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: 'var(--color-primary-dark)',
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Pagination */}
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
      </main>

      <Footer />
    </div>
  );
};

export default DocumentationPage;
