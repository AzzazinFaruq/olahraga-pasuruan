import React from "react";
import Link from "next/link";

const Table = ({
  currentResults,
  getMedal,
  formatDate,
  hideEventColumn = false,
}) => {
  return (
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
            {!hideEventColumn && (
              <th
                className="p-4 text-left"
                style={{ borderBottom: "1px solid var(--color-gray-200)" }}
              >
                Event
              </th>
            )}
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
              {!hideEventColumn && (
                <td className="p-4">
                  {result.event_name || "PORPROV JATIM XI"}
                </td>
              )}
              <td className="p-4">
                {result.nomor?.cabor?.nama_cabor || "N/A"}
              </td>
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
  );
};

export default Table;
