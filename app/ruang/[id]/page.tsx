import { supabasePublic } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const instant = false;

export default async function DetailRuangan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const ruangId = resolvedParams.id;

  // Ambil data ruang
  const { data: ruang, error: errorRuang } = await supabasePublic
    .from("ruang")
    .select("*")
    .eq("id", ruangId)
    .single();

  if (errorRuang || !ruang) notFound();

  const { data: jadwalList, error: errorJadwal } = await supabasePublic
    .from("peminjaman")
    .select("tanggal, mulai, selesai, keperluan")
    .eq("ruang_id", ruangId)
    .eq("status", "disetujui")
    .order("tanggal", { ascending: true });

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Informasi Ruangan */}
      <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium uppercase text-blue-700">
        {ruang.jenis}
      </span>

      <h1 className="mt-2 text-3xl font-bold text-slate-900">{ruang.nama}</h1>

      <p className="mt-1 text-slate-500">{ruang.lokasi}</p>

      <div className="mt-4 space-y-2">
        <p className="text-lg font-semibold text-slate-900">
          Kapasitas {ruang.kapasitas} orang
        </p>

        <p className="text-sm text-slate-500">
          Informasi ruang dan laboratorium PinjamLab
        </p>
      </div>

      {/* Jadwal Ruangan */}
      <section className="mt-8">
        <h2 className="mb-1 text-xl font-bold text-slate-900">
          Jadwal Ruangan Disetujui
        </h2>

        <p className="mb-4 text-sm text-slate-500">
          Daftar kegiatan yang telah mendapatkan persetujuan.
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
                <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Disetujui
                </span>

                <h3 className="mt-2 font-bold text-slate-900">{j.keperluan}</h3>

                <p className="mt-2 text-sm text-slate-500">
                  Tanggal: {j.tanggal}
                </p>

                <p className="text-sm text-slate-500">
                  Waktu: {j.mulai} - {j.selesai}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Belum ada jadwal peminjaman yang disetujui untuk ruangan ini.
            </p>
          </div>
        )}
      </section>
    </article>
  );
}
