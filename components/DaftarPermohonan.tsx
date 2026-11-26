"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

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
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-xs border border-slate-200">
          <div>
            <h1 className="text-base font-bold text-slate-900">
              PinjamLab Admin
            </h1>
            <p className="text-xs text-slate-500">
              Panel Kontrol Peminjaman Ruangan
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loadingLogout}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {loadingLogout ? "Keluar..." : "Keluar"}
          </button>
        </header>

        {errorLogout && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            {errorLogout}
          </div>
        )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500">
              Menunggu Persetujuan
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {jumlahMenunggu}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500">
              Peminjaman Disetujui
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {jumlahDisetujui}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500">
              Permohonan Ditolak
            </p>
            <p className="mt-1 text-2xl font-bold text-rose-600">
              {jumlahDitolak}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Daftar Permohonan
              </h2>
              <p className="text-xs text-slate-500">
                Kelola status dan tinjau detail pengajuan masuk.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/admin/ruang"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Kelola Ruangan
              </Link>

              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                  placeholder="Cari peminjam / ruangan..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap gap-1.5">
              {filterStatus.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    filter === item.value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Menampilkan {dataTersaring.length} dari {data.length} data
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {dataTersaring.length > 0 ? (
              dataTersaring.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            item.status === "disetujui"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "ditolak"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">
                          {item.ruang?.nama ?? "Ruangan tidak ditemukan"}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-slate-800">
                        {item.peminjam}{" "}
                        <span className="text-slate-400 font-normal">
                          ({item.jumlah_orang} orang)
                        </span>
                      </p>

                      <p className="text-xs text-slate-500">
                        {formatTanggal(item.tanggal)} • {item.mulai.slice(0, 5)}{" "}
                        - {item.selesai.slice(0, 5)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setDetailId(detailId === item.id ? null : item.id)
                      }
                      className="self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 sm:self-auto"
                    >
                      {detailId === item.id ? "Tutup Detail" : "Lihat Detail"}
                    </button>
                  </div>

                  {detailId === item.id && (
                    <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-700">
                          Informasi Lengkap Permohonan
                        </h3>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                          <div>
                            <span className="text-slate-500">
                              Nama Peminjam
                            </span>
                            <p className="font-semibold text-slate-900 mt-0.5">
                              {item.peminjam}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-500">Ruangan</span>
                            <p className="font-semibold text-slate-900 mt-0.5">
                              {item.ruang?.nama ?? "-"}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-500">
                              Tanggal Peminjaman
                            </span>
                            <p className="font-semibold text-slate-900 mt-0.5">
                              {formatTanggal(item.tanggal)}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-500">
                              Waktu Peminjaman
                            </span>
                            <p className="font-semibold text-slate-900 mt-0.5">
                              {item.mulai.slice(0, 5)} –{" "}
                              {item.selesai.slice(0, 5)}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-500">
                              Jumlah Peminjam
                            </span>
                            <p className="font-semibold text-slate-900 mt-0.5">
                              {item.jumlah_orang} orang
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-500">
                              Status Permohonan
                            </span>
                            <p className="font-semibold uppercase text-slate-900 mt-0.5">
                              {item.status}
                            </p>
                          </div>

                          <div className="sm:col-span-2">
                            <span className="text-slate-500">Keperluan</span>
                            <p className="font-semibold text-slate-900 mt-0.5">
                              {item.keperluan}
                            </p>
                          </div>

                          {item.alasan_tolak && (
                            <div className="sm:col-span-2 mt-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
                              <span className="font-bold">
                                Alasan Penolakan:
                              </span>{" "}
                              {item.alasan_tolak}
                            </div>
                          )}
                        </div>
                      </div>

                      {item.status === "menunggu" ? (
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 sm:flex-row sm:items-center">
                          <form action={updateStatus}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              name="status"
                              value="disetujui"
                              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
                            >
                              Setujui
                            </button>
                          </form>

                          <form
                            action={updateStatus}
                            className="flex flex-1 gap-2"
                          >
                            <input type="hidden" name="id" value={item.id} />
                            <input
                              type="text"
                              name="alasan_tolak"
                              minLength={5}
                              required
                              placeholder="Alasan penolakan (minimal 5 karakter)..."
                              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-500"
                            />
                            <button
                              type="submit"
                              name="status"
                              value="ditolak"
                              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                            >
                              Tolak
                            </button>
                          </form>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Permohonan ini telah diproses sebelumnya.
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-500">
                Tidak ada permohonan yang sesuai dengan filter atau pencarian.
              </div>
            )}
          </div>
        </section>

        <footer className="text-center text-xs text-slate-400 py-2">
          PinjamLab Admin Panel
        </footer>
      </div>
    </main>
  );
}
