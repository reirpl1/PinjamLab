import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="py-12 px-6 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-lg mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Selamat Datang di PinjamLab
        </h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto mb-6">
          Sistem peminjaman ruang dan laboratorium sekolah secara online, cepat,
          dan transparan.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
        <Link
          href="/ruang"
          className="border border-gray-300 rounded-xl p-6 shadow-sm hover: shadow-md transition bg-white"
        >
          <h2 className="text-xl font-bold mb-3">Daftar Ruang</h2>
          <p className="text-gray-500">
            Lihat ketersediaan ruangan dan lab aktif.
          </p>
        </Link>

        <Link
          href="/peminjaman"
          className="border border-gray-300 rounded-xl p-6 shadow-sm hover: shadow-md transition bg-white"
        >
          <h2 className="text-xl font-bold mb-3">Ajukan Peminjaman</h2>
          <p className="text-gray-500">Buat formulir pengajuan jadwal baru</p>
        </Link>

        <Link
          href="/jadwal"
          className="border border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-md transition bg-white"
        >
          <h2 className="text-xl font-bold mb-3">Jadwal Publik</h2>
          <p className="text-gray-500">
            Lihat jadwal kegiatan yang sudah disetujui.
          </p>
        </Link>
      </div>
    </div>
  );
}
