"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Permohonan = {
  id: number;
  peminjam: string;
  keperluan: string;
  tanggal: string;
  mulai: string;
  selesai: string;
  jumlah_orang: number;
  status: "menunggu" | "disetujui" | "ditolak";
  alasan_tolak: string | null;
  ruang: {
    nama: string;
  } | null;
};

type Props = {
  data: Permohonan[];
  updateStatus: (formData: FormData) => Promise<void>;
};

const filterStatus = [
  { label: "Semua", value: "Semua" },
  { label: "Menunggu", value: "menunggu" },
  { label: "Disetujui", value: "disetujui" },
  { label: "Ditolak", value: "ditolak" },
];

export default function DaftarPermohonan({ data, updateStatus }: Props) {
  const router = useRouter();

  const [filter, setFilter] = useState("Semua");
  const [cari, setCari] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [errorLogout, setErrorLogout] = useState("");

  const jumlahMenunggu = data.filter(
    (item) => item.status === "menunggu",
  ).length;

  const jumlahDisetujui = data.filter(
    (item) => item.status === "disetujui",
  ).length;

  const jumlahDitolak = data.filter((item) => item.status === "ditolak").length;

  const dataTersaring = useMemo(() => {
    return data.filter((item) => {
      const sesuaiStatus = filter === "Semua" || item.status === filter;

      const kataKunci = cari.toLowerCase().trim();

      const sesuaiPencarian =
        item.peminjam.toLowerCase().includes(kataKunci) ||
        (item.ruang?.nama ?? "").toLowerCase().includes(kataKunci) ||
        item.keperluan.toLowerCase().includes(kataKunci);

      return sesuaiStatus && sesuaiPencarian;
    });
  }, [data, filter, cari]);

  function formatTanggal(tanggal: string) {
    return new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function warnaStatus(status: string) {
    if (status === "disetujui") {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }

    if (status === "ditolak") {
      return "bg-rose-100 text-rose-800 border-rose-200";
    }

    return "bg-amber-100 text-amber-800 border-amber-200";
  }

  // Fungsi Logout

  async function handleLogout() {
    setLoadingLogout(true);
    setErrorLogout("");

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Konfigurasi Supabase browser tidak ditemukan.");
      }

      const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabaseBrowser.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      setErrorLogout(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat logout.",
      );

      setLoadingLogout(false);
    }
  }

  return (
    <main className="min-h-screen bg-[hsl(0,0%,100%)] px-4 py-5 sm:px-6 sm:py-7 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <header className="flex items-center justify-between rounded-lg bg-[#1E293B] px-5 py-3.5 shadow-sm">
          <h1 className="text-lg font-extrabold text-white">Panel Admin</h1>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loadingLogout}
            className="text-sm font-medium text-white underline underline-offset-4 transition hover:text-indigo-200 disabled:opacity-50"
          >
            {loadingLogout ? "Keluar..." : "Keluar"}
          </button>
        </header>

        {errorLogout && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorLogout}
          </div>
        )}

        {/* JUDUL HALAMAN */}
        <section className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Kelola Permohonan
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Kelola dan pantau semua permohonan peminjaman ruang.
            </p>
          </div>
        </section>

        {/* STATISTIK */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* MENUNGGU */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-[#FFF7DF] to-[#FFEBC1] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-800">Menunggu</p>

                <p className="mt-2 text-3xl font-bold text-amber-800">
                  {jumlahMenunggu}
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  Perlu ditinjau admin
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-200 text-2xl text-amber-800">
                ◷
              </div>
            </div>
          </div>

          {/* DISETUJUI */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-[#E1F8EC] to-[#C8F0DB] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Disetujui
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-800">
                  {jumlahDisetujui}
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  Permohonan diterima
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-200 text-2xl text-emerald-800">
                ✓
              </div>
            </div>
          </div>

          {/* DITOLAK */}
          <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-[#FFE9EC] to-[#FFD6DE] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-rose-800">Ditolak</p>

                <p className="mt-2 text-3xl font-bold text-rose-800">
                  {jumlahDitolak}
                </p>

                <p className="mt-1 text-xs text-rose-700">
                  Permohonan tidak diterima
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-200 text-2xl text-rose-800">
                ✕
              </div>
            </div>
          </div>
        </section>

        {/* DAFTAR PERMOHONAN */}
        <section className="rounded-2xl border border-white bg-[#F8F7FF] p-4 shadow-md shadow-indigo-200/30 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-[#292B64]">
                Daftar Permohonan
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Informasi dan status peminjaman ruang
              </p>
            </div>

            <span className="rounded-full border border-indigo-200 bg-indigo-100 px-4 py-2 text-xs font-semibold text-indigo-800">
              Total: {data.length} Permohonan
            </span>
          </div>

          {/* PENCARIAN */}
          <div className="relative mt-5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-indigo-500">
              ⌕
            </span>

            <input
              type="text"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nama peminjam, ruangan, atau keperluan..."
              className="w-full rounded-xl border border-indigo-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {/* FILTER */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {filterStatus.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    filter === item.value
                      ? "border-[#34356F] bg-[#34356F] text-white shadow-sm"
                      : "border-indigo-200 bg-white text-slate-600 hover:bg-indigo-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setCari("");
                setFilter("Semua");
              }}
              className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100"
            >
              ↻ Reset Filter
            </button>
          </div>

          {/* JUMLAH HASIL */}
          <p className="mt-5 text-xs text-slate-500">
            Menampilkan{" "}
            <span className="font-bold text-indigo-800">
              {dataTersaring.length}
            </span>{" "}
            dari {data.length} permohonan
          </p>

          {/* DAFTAR CARD */}
          <div className="mt-3 space-y-3">
            {dataTersaring.length > 0 ? (
              dataTersaring.map((item) => (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-2xl border border-indigo-100 border-l-4 bg-white shadow-sm transition hover:shadow-md ${
                    item.status === "menunggu"
                      ? "border-l-amber-400"
                      : item.status === "disetujui"
                        ? "border-l-emerald-500"
                        : "border-l-rose-500"
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    {/* INFORMASI UTAMA */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-800 sm:flex">
                          ▣
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-[#292B64]">
                            {item.peminjam}
                          </h4>

                          <p className="mt-1 text-sm font-semibold text-indigo-700">
                            {item.ruang?.nama ?? "Ruang tidak ditemukan"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatTanggal(item.tanggal)}
                          </p>

                          <p className="mt-2 text-sm text-slate-700">
                            <span className="font-semibold">
                              {item.mulai.slice(0, 5)} –{" "}
                              {item.selesai.slice(0, 5)}
                            </span>
                            <span className="mx-2 text-indigo-300">•</span>
                            {item.jumlah_orang} orang
                          </p>

                          <p className="mt-2 text-sm text-slate-500">
                            {item.keperluan}
                          </p>
                        </div>
                      </div>

                      {/* STATUS DAN DETAIL */}
                      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <span
                          className={`rounded-full border px-4 py-1.5 text-xs font-bold ${warnaStatus(item.status)}`}
                        >
                          {item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setDetailId(detailId === item.id ? null : item.id)
                          }
                          className="rounded-xl bg-indigo-100 px-4 py-2 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-200"
                        >
                          {detailId === item.id
                            ? "Tutup Detail ↑"
                            : "Lihat Detail →"}
                        </button>
                      </div>
                    </div>

                    {/* DETAIL */}
                    {detailId === item.id && (
                      <div className="mt-5 rounded-xl border border-indigo-200 bg-[#EFEEFC] p-4 sm:p-5">
                        <h5 className="mb-4 font-bold text-[#292B64]">
                          Informasi Lengkap Permohonan
                        </h5>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium text-slate-500">
                              Nama Peminjam
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {item.peminjam}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-slate-500">
                              Ruangan
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {item.ruang?.nama ?? "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-slate-500">
                              Tanggal Peminjaman
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {formatTanggal(item.tanggal)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-slate-500">
                              Waktu Peminjaman
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {item.mulai.slice(0, 5)} –{" "}
                              {item.selesai.slice(0, 5)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-slate-500">
                              Jumlah Peminjam
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {item.jumlah_orang} orang
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-slate-500">
                              Status Permohonan
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {item.status.toUpperCase()}
                            </p>
                          </div>

                          <div className="sm:col-span-2">
                            <p className="text-xs font-medium text-slate-500">
                              Keperluan
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {item.keperluan}
                            </p>
                          </div>

                          {item.alasan_tolak && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 sm:col-span-2">
                              <p className="text-xs font-bold text-rose-700">
                                Alasan Penolakan
                              </p>
                              <p className="mt-1 text-sm text-rose-800">
                                {item.alasan_tolak}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* AKSI ADMIN */}
                        {item.status === "menunggu" ? (
                          <div className="mt-5 border-t border-indigo-200 pt-4">
                            <h6 className="mb-3 text-sm font-bold text-[#292B64]">
                              Tindakan Admin
                            </h6>

                            <div className="flex flex-col gap-3 sm:flex-row">
                              {/* SETUJUI */}
                              <form action={updateStatus} className="sm:w-auto">
                                <input
                                  type="hidden"
                                  name="id"
                                  value={item.id}
                                />

                                <button
                                  type="submit"
                                  name="status"
                                  value="disetujui"
                                  className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
                                >
                                  ✓ Setujui Permohonan
                                </button>
                              </form>

                              {/* TOLAK */}
                              <form
                                action={updateStatus}
                                className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
                              >
                                <input
                                  type="hidden"
                                  name="id"
                                  value={item.id}
                                />

                                <input
                                  type="text"
                                  name="alasan_tolak"
                                  minLength={5}
                                  required
                                  placeholder="Masukkan alasan penolakan..."
                                  className="min-w-0 flex-1 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                />

                                <button
                                  type="submit"
                                  name="status"
                                  value="ditolak"
                                  className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                                >
                                  Tolak
                                </button>
                              </form>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-5 border-t border-indigo-200 pt-4 text-sm text-slate-500">
                            ✓ Permohonan ini sudah diproses.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-indigo-300 bg-white py-14 text-center">
                <div className="text-4xl text-indigo-300">▤</div>

                <p className="mt-3 font-semibold text-slate-700">
                  Tidak ada permohonan ditemukan.
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Coba ubah filter atau kata pencarian.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pb-3 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} PinjamLab — Admin Panel
        </footer>
      </div>
    </main>
  );
}
