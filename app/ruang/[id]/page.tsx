import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export const instant = false;

export default async function DetailRuangan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const ruangId = resolvedParams.id;

  // 1. Ambil data detail ruangan berdasarkan ID
  const { data: ruang, error: errorRuang } = await supabaseAdmin
    .from("ruang")
    .select("*")
    .eq("id", ruangId)
    .single();

  if (errorRuang || !ruang) notFound();

  // 2. Ambil daftar jadwal yang berstatus 'disetujui' (Tanpa mengambil kolom 'peminjam')
  const { data: jadwalList, error: errorJadwal } = await supabaseAdmin
    .from("peminjaman")
    .select("tanggal, mulai, selesai, keperluan, jumlah_orang")
    .eq("ruang_id", ruangId)
    .eq("status", "disetujui")
    .order("tanggal", { ascending: true })
    .order("mulai", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Informasi Spesifikasi Ruangan */}
        <div className="text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-block rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-blue-700">
              {ruang.jenis}
            </span>
            {!ruang.aktif && (
              <span className="inline-block rounded bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                Nonaktif / Dalam Perbaikan
              </span>
            )}
          </div>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {ruang.nama}
          </h1>
          <p className="mt-1 text-slate-500">{ruang.lokasi}</p>

          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-2">
              <p className="text-xs text-slate-500 font-medium">
                Kapasitas Maksimal
              </p>
              <p className="text-base font-bold text-slate-900">
                {ruang.kapasitas} Orang
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-2 text-left">
              <p className="text-xs text-blue-600 font-medium">
                Ketentuan Peminjaman
              </p>
              <p className="text-xs text-slate-600">
                Peminjaman berlaku untuk satu ruangan penuh.
              </p>
            </div>
          </div>
        </div>

        {/* Tombol Ajukan Peminjaman di Bagian Tengah / Bawah Info */}
        <div className="mt-6 flex justify-center border-t border-slate-100 pt-6">
          {ruang.aktif ? (
            <Link
              href={`/pinjam?ruang_id=${ruang.id}`}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Ajukan Peminjaman Ruangan Ini
            </Link>
          ) : (
            <span className="inline-block w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-100 px-6 py-3 text-center text-sm font-medium text-slate-500">
              Maaf, Ruangan Sedang Tidak Tersedia
            </span>
          )}
        </div>

        {/* Transparansi Jadwal Ruangan */}
        <section className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="mb-1 text-xl font-bold text-slate-900">
            Jadwal Ruangan Disetujui
          </h2>

          <p className="mb-4 text-sm text-slate-500">
            Daftar kegiatan yang telah mendapatkan persetujuan pada ruangan ini.
          </p>

          {errorJadwal ? (
            <p className="text-sm text-red-500">Gagal memuat jadwal ruangan.</p>
          ) : jadwalList && jadwalList.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {jadwalList.map((j, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Disetujui
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900">{j.keperluan}</h3>

                  <div className="mt-2 space-y-1 text-sm text-slate-500">
                    <p>Tanggal: {j.tanggal}</p>
                    <p>
                      Waktu: {j.mulai.slice(0, 5)} - {j.selesai.slice(0, 5)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Estimasi Peserta: {j.jumlah_orang} orang
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-sm text-slate-500">
                Belum ada jadwal peminjaman yang disetujui untuk ruangan ini.
                Ruangan kosong dan siap diajukan!
              </p>
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
 