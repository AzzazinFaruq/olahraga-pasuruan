import React from "react";

const Filter = ({
  filterCabor,
  handleFilterCaborChange,
  filterNomor,
  handleFilterNomorChange,
  cabors,
  nomors,
  searchQuery,
  setSearchQuery,
  setShowModal,
}) => {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:flex-1 relative">
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
            {cabors.map((cabor) => (
              <option key={cabor.id} value={cabor.nama_cabor}>
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

        <div className="w-full md:flex-1 relative">
          <select
            value={filterNomor}
            onChange={handleFilterNomorChange}
            className="w-full p-3 rounded-lg border appearance-none"
            style={{
              borderColor: "var(--color-gray-300)",
              backgroundColor: "var(--color-white)",
            }}
            disabled={!filterCabor}
          >
            <option value="">Semua Nomor Pertandingan</option>
            {nomors
              .filter((nomor) =>
                filterCabor
                  ? cabors.find((c) => c.nama_cabor === filterCabor)?.id ===
                    nomor.cabor_id
                  : true
              )
              .map((nomor) => (
                <option key={nomor.id} value={nomor.nama_nomor}>
                  {nomor.nama_nomor}
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
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
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

        <button
          onClick={() => setShowModal(true)}
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
        </button>
      </div>
    </div>
  );
};

export default Filter;
