import React, { useMemo } from "react";

const Modal = ({
  showModal,
  setShowModal,
  newResult,
  setNewResult,
  athletes,
  cabors,
  nomors,
  saveResults,
  error,
  setError,
  handleAthleteChange,
  addAthlete,
  removeAthlete,
  addDokumentasi,
  removeDokumentasi,
  handleDokumentasiChange,
  fixedEventName = false,
}) => {
  const nomorsForModal = useMemo(() => {
    if (!newResult.cabor) return [];
    return nomors.filter((n) => n.cabor_id == newResult.cabor);
  }, [newResult.cabor, nomors]);

  return (
    showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl">
          <div className="p-6">
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-gray-700)" }}
              >
                Nama Event
              </label>
              {fixedEventName ? (
                // Tampilkan sebagai teks jika fixedEventName true
                <div className="p-3 bg-gray-100 rounded-lg">
                  PORPROV JATIM XI
                </div>
              ) : (
                // Tampilkan input jika fixedEventName false
                <input
                  value={newResult.eventName}
                  onChange={(e) =>
                    setNewResult({
                      ...newResult,
                      eventName: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full p-3 rounded-lg border uppercase"
                  style={{
                    borderColor: "var(--color-gray-300)",
                    textTransform: "uppercase",
                  }}
                />
              )}
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-gray-700)" }}
              >
                Cabang Olahraga
              </label>
              <div className="relative">
                <select
                  value={newResult.cabor}
                  onChange={(e) =>
                    setNewResult({
                      ...newResult,
                      cabor: e.target.value,
                      nomor: "",
                    })
                  }
                  className="w-full p-3 rounded-lg border appearance-none"
                  style={{
                    borderColor: "var(--color-gray-300)",
                    backgroundColor: "var(--color-white)",
                  }}
                >
                  <option value="">Pilih Cabang Olahraga</option>
                  {cabors.map((cabor) => (
                    <option key={cabor.id} value={cabor.id}>
                      {cabor.nama_cabor}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-gray-700)" }}
              >
                Nomor Pertandingan
              </label>
              <div className="relative">
                <select
                  value={newResult.nomor}
                  onChange={(e) =>
                    setNewResult({ ...newResult, nomor: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border appearance-none"
                  style={{
                    borderColor: "var(--color-gray-300)",
                    backgroundColor: "var(--color-white)",
                  }}
                  disabled={!newResult.cabor}
                >
                  <option value="">Pilih Nomor Pertandingan</option>
                  {nomorsForModal.map((nomor) => (
                    <option key={nomor.id} value={nomor.id}>
                      {nomor.nama_nomor}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-gray-700)" }}
              >
                Catatan (Opsional)
              </label>
              <textarea
                value={newResult.catatan}
                onChange={(e) =>
                  setNewResult({ ...newResult, catatan: e.target.value })
                }
                className="w-full p-3 rounded-lg border"
                style={{
                  borderColor: "var(--color-gray-300)",
                }}
                placeholder="Masukkan catatan tambahan"
                rows="3"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-gray-700)" }}
              >
                Atlet
              </label>
              {newResult.atlet.map((athlete, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <div className="flex-1 relative">
                    <select
                      value={athlete.id}
                      onChange={(e) =>
                        handleAthleteChange(index, "id", e.target.value)
                      }
                      className="w-full p-3 rounded-lg border pr-10 appearance-none"
                      style={{
                        borderColor: "var(--color-gray-300)",
                      }}
                    >
                      <option value="">Pilih Atlet</option>
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nama}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="relative w-40">
                    <select
                      value={athlete.posisi}
                      onChange={(e) =>
                        handleAthleteChange(index, "posisi", e.target.value)
                      }
                      className="w-full p-3 rounded-lg border appearance-none"
                      style={{
                        borderColor: "var(--color-gray-300)",
                      }}
                    >
                      <option value="">Pilih Medali</option>
                      <option value="Emas">Emas</option>
                      <option value="Perak">Perak</option>
                      <option value="Perunggu">Perunggu</option>
                      <option value="Partisipasi">Partisipasi</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  {newResult.atlet.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAthlete(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                      aria-label="Hapus atlet"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addAthlete}
                className="flex items-center gap-1 text-sm mt-2"
                style={{ color: "var(--color-primary)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
              </button>
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-gray-700)" }}
              >
                Dokumentasi
              </label>
              {newResult.dokumentasi.map((doc, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <div className="flex-1">
                    <input
                      type="file"
                      onChange={(e) =>
                        handleDokumentasiChange(
                          index,
                          "file",
                          e.target.files[0]
                        )
                      }
                      className="w-full p-2 rounded-lg border"
                      style={{
                        borderColor: "var(--color-gray-300)",
                      }}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <select
                      value={doc.atletId}
                      onChange={(e) =>
                        handleDokumentasiChange(
                          index,
                          "atletId",
                          e.target.value
                        )
                      }
                      className="w-full p-2 rounded-lg border appearance-none"
                      style={{
                        borderColor: "var(--color-gray-300)",
                      }}
                    >
                      <option value="">Pilih Atlet</option>
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nama}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {newResult.dokumentasi.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDokumentasi(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                      aria-label="Hapus dokumentasi"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDokumentasi}
                className="flex items-center gap-1 text-sm mt-2"
                style={{ color: "var(--color-primary)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Tambah Dokumentasi
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                }}
                className="px-4 py-2 rounded-lg border"
                style={{
                  borderColor: "var(--color-gray-300)",
                }}
              >
                Batal
              </button>
              <button
                onClick={saveResults}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
