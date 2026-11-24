import { supabasePublic } from "@/lib/supabase";

export const instant = false;

export default async function JadwalPublik() {
  const { data: peminjamanList, error } = await supabasePublic
    .from("peminjaman")
    .select("*, ruang(nama)")
    .eq("status", "disetujui")
    .order("tanggal", { ascending: true });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Judul Card Utama */}
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Jadwal Publik Peminjaman Disetujui
      </h1>

      <p className="mb-5 text-sm text-slate-500">
        Daftar jadwal peminjaman ruangan yang telah disetujui.
      </p>

      {error ? (
        <p className="text-red-500">Gagal memuat jadwal peminjaman.</p>
      ) : peminjamanList && peminjamanList.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-slate-500">
            {peminjamanList.length} jadwal ditemukan
          </p>

          {/* Kumpulan Card Jadwal */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {peminjamanList.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Disetujui
                </span>

                <h2 className="mt-2 text-lg font-bold text-slate-900">
                  {item.ruang?.nama ?? "Ruangan tidak diketahui"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  <strong>Tanggal:</strong> {item.tanggal}
                </p>

                <p className="text-sm text-slate-500">
                  <strong>Waktu:</strong> {item.mulai} - {item.selesai}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  <strong>Keperluan:</strong> {item.keperluan}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          Belum ada jadwal peminjaman yang disetujui.
        </p>
      )}
    </div>
  );
}
