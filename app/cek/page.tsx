import { supabaseAdmin } from "@/lib/supabase";
import { connection } from "next/server";

export const instant = false;

export default async function CekStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ nama?: string }>;
}) {
  await connection();

  const resolvedParams = await searchParams;
  const keyword = resolvedParams.nama?.trim() || "";

  let hasilPencarian: any[] = [];
  let errorMsg = "";

  // Ambil daftar ruang untuk mapping nama ruang
  const { data: ruangList } = await supabaseAdmin
    .from("ruang")
    .select("id, nama");
  const ruangMap = new Map(ruangList?.map((r) => [r.id, r.nama]) || []);

  // Lakukan pencarian jika user memasukkan kata kunci nama
  if (keyword) {
    const { data, error } = await supabaseAdmin
      .from("peminjaman")
      .select("*")
      .ilike("peminjam", `%${keyword}%`)
      .order("dibuat", { ascending: false });

    if (error) {
      errorMsg = error.message;
    } else {
      hasilPencarian = data || [];
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-950">
        Cek Status Peminjaman
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Masukkan nama peminjam untuk melihat status persetujuan pengajuan ruang
        atau laboratorium.
      </p>

      {/* Form Pencarian */}
      <form
        method="GET"
        action="/cek"
        className="mb-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row"
      >
        <input
          type="text"
          name="nama"
          defaultValue={keyword}
          placeholder="Ketik nama peminjam (contoh: Nadia)..."
          required
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Cari Status
        </button>
      </form>

      {/* Hasil Pencarian */}
      {errorMsg && (
        <p className="mb-4 text-sm text-red-500">
          Terjadi kesalahan: {errorMsg}
        </p>
      )}

      {keyword && (
        <div>
          <p className="mb-4 text-sm text-slate-600">
            Menampilkan hasil untuk: <strong>&quot;{keyword}&quot;</strong> (
            {hasilPencarian.length} ditemukan)
          </p>

          {hasilPencarian.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              Data peminjaman atas nama <strong>{keyword}</strong> tidak
              ditemukan.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hasilPencarian.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div>
                    {/* Badge Status */}
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className={`inline-block rounded px-2.5 py-1 text-xs font-semibold uppercase ${
                          item.status === "disetujui"
                            ? "bg-green-100 text-green-700"
                            : item.status === "ditolak"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        ID #{item.id}
                      </span>
                    </div>

                    <h2 className="mb-2 text-lg font-bold text-slate-900">
                      {ruangMap.get(item.ruang_id) ?? "Ruangan tidak diketahui"}
                    </h2>

                    <div className="space-y-1 text-sm text-slate-600">
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

                  {/* Tampilkan alasan jika status ditolak */}
                  {item.status === "ditolak" && item.alasan_tolak && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      <strong>Alasan Penolakan:</strong> {item.alasan_tolak}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
