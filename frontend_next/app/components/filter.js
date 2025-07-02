import React from "react";

const Filter = ({
  filterCabor,
  handleFilterCaborChange,
  filterNomor,
  handleFilterNomorChange,
  cabors,
  nomors,
}) => {
  return (
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
  );
};

export default Filter;
