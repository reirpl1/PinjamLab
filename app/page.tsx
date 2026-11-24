import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="py-12 px-6 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-lg mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Selamat Datang di PinjamLab
        </h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto mb-6">
          Sistem peminjaman ruang dan laboratorium sekolah secara online, cepat, dan transparan.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/ruang"
            className="bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-lg shadow hover:bg-gray-100 transition"
          >
            Lihat Daftar Ruang
          </Link>
          <Link
            href="/cek"
            className="bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-lg shadow hover:bg-blue-900 transition"
          >
            Cek Status Peminjaman
          </Link>
        </div>
      </div>
    </div>
  );
}