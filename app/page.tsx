import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx--auto p-8 text-center">
      <h1 className="text-4xl font=bold mb-4">Selamat Datang di PinjamLab</h1>
      <p className="text-gray-600 mb-8">
        Aplikasi Peminjaman Ruang dan Laboratorium Sekolah Secara Online
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/ruang"
          className="p-6 border rounded-lg shadow hover:bg-gray-50"
        >
          <h2 className="font-semibold text-lg mb-2">Daftar Ruang</h2>
          <p className="text-sm text-gray-500">
            Lihat ketersediaan ruangan dan lab aktif.
          </p>
        </Link>
        <Link
          href="/pinjam"
          className="p-6 border rounded-lg shadow hover:bg-gray-50"
        >
          <h2 className="font-semibold text-lg mb-2">Ajukan Peminjaman</h2>
          <p className="text-sm text-gray-500">
            Buat formulir pengajuan jadwal baru.
          </p>
        </Link>
        <Link
          href="/peminjaman"
          className="p-6 border rounded-lg shadow hover:bg-gray-50"
        >
          <h2 className="font-semibold text-lg mb-2">Jadwal Publik</h2>
          <p className="text-sm text-gray-500">
            Lihat jadwal kegiatan yang sudah disetujui.
          </p>
        </Link>
      </div>

      <div className="mt-8">
        <Link href="/login" className="text-sm text-blue-600 underline">
          Login Admin Sarana-Prasarana
        </Link>
      </div>
    </div>
  );
}
