import { supabaseAdmin } from "@/lib/supabase";
import { connection } from "next/server";

export const instant = false;

export default async function JadwalPublik() {
  await connection();

  // Ambil data peminjaman yang disetujui menggunakan supabaseAdmin (bypass RLS)
  const { data: peminjamanList, error } = await supabaseAdmin
    .from("peminjaman")
    .select("*")
    .eq("status", "disetujui")
    .order("tanggal", { ascending: true });

  // Ambil juga data ruang untuk mapping nama ruangan
  const { data: ruangList } = await supabaseAdmin
    .from("ruang")
    .select("id, nama");

  // Buat dictionary/peta ID ruang ke Nama Ruang
  const ruangMap = new Map(ruangList?.map((r) => [r.id, r.nama]) || []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-950">
        Jadwal Publik Peminjaman Ruang
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Daftar seluruh jadwal peminjaman laboratorium dan ruang yang telah
        disetujui.
      </p>

      {error && (
        <p className="text-red-500 mb-4">
          Gagal memuat jadwal: {error.message}
        </p>
      )}

      {/* Perhatikan penulisan peminjamanList secara lengkap di sini */}
      {!peminjamanList || peminjamanList.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Belum ada jadwal peminjaman yang disetujui.
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {peminjamanList.length} jadwal ditemukan
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {peminjamanList.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 uppercase mb-3">
                    Disetujui
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">
                    {ruangMap.get(item.ruang_id) ?? "Ruangan tidak diketahui"}
                  </h2>
                  <div className="space-y-1.5 text-sm text-slate-600 mb-4">
                    <p>
                      <strong>Peminjam:</strong> {item.peminjam}
                    </p>
                    <p>
                      <strong>Tanggal:</strong> {item.tanggal}
                    </p>
                    <p>
                      <strong>Waktu:</strong> {item.mulai} - {item.selesai}
                    </p>
                    <p>
                      <strong>Keperluan:</strong> {item.keperluan}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
