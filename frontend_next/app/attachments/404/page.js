import Image from "next/image";
import Link from "next/link";
import NotFoundIcon from "@/public/not-found-icon.png"; 

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="w-full max-w-md">
        <div
          className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center"
          style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="mb-8">
            <Image
              src={NotFoundIcon}
              alt="Not Found"
              width={120}
              height={120}
            />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--color-gray-800)" }}>
            404 - Tidak Ditemukan
          </h2>
          <p className="text-center mb-8" style={{ color: "var(--color-gray-600)" }}>
            Maaf, halaman yang Anda cari tidak ditemukan.
          </p>
          <Link href="/">
            <button
              className="py-3 px-8 rounded-lg font-bold transition-colors duration-300"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-white)",
                hoverBackgroundColor: "var(--color-primary-dark)",
              }}
            >
              Kembali ke Beranda
            </button>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: "var(--color-gray-500)" }}>
            © 2025 KONI Kabupaten Pasuruan. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}