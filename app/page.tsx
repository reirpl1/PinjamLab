import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero Section */}
      <section className="mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 via-blue-600 to-sky-500 px-6 py-12 text-center shadow-lg sm:px-12 sm:py-16">
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Selamat Datang di PinjamLab
        </h1>

        <p className="mx-auto max-w-2xl text-base loading-relaxed text-blue-50 sm:text-lg">
          Aplikasi Peminjaman Ruanng dan Laboratorium Sekolah Secara Online
        </p>
      </section>

      {/* menu utama */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Link
          href="/ruang"
          className="rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm transition-all duration-200 hover:translate-y-1 hover:border-blue-300 hover:shadow-lg"
        >
          <h2 className="mb-3 text-xl font-bold text-slate-800">
            Daftar Ruang
          </h2>
          <p className="text-sm leading-relaxed text-slate-500">
            Lihat ketersediaan ruangan dan lab aktif.
          </p>
        </Link>

        <Link
          href="/pinjam"
          className="rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
        >
          <h2 className="mb-3 text-xl font-bold text-slate-800">
            Ajukan Peminjaman
          </h2>
          <p className="text-sm leading-relaxed text-slate-500">
            Buat formulir pengajuan jadwal baru.
          </p>
        </Link>

        <Link
          href="/peminjaman"
          className="rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
        >
          <h2 className="mb-3 text-xl font-bold text-slate-800">
            Jadwal Publik
          </h2>
          <p className="text-sm leading-relaxed text-slate-500">
            Lihat jadwal kegiatan yang sudah disetujui.
          </p>
        </Link>
      </div>

      {/* Login Admin */}
      <div className="mt-10 text-center">
        <Link
          href="/login"
          className="inline-block rounded-lg border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
        >
          Login Admin Sarana-Prasarana →
        </Link>
      </div>
    </div>
  );
}
