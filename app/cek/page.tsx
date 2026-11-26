import { supabaseAdmin } from "@/lib/supabase";
import { connection } from "next/server";

export const instant = false;

export default async function CekStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ nama?: string; id?: string }>;
}) {
  await connection();

  const resolveParams = await searchParams;
  const keywordNama = resolveParams.nama?.trim() || "";
  const keywordId = resolveParams.id?.trim() || "";

  let hasilPencarian: any[] = [];
  let errorMsg = "";

  // Ambil data ruang untuk mapping nama ruangan
  const { data: ruangList } = await supabaseAdmin
    .from("ruang")
    .select("id, nama");
  const ruangMap = new Map(ruangList?.map((r) => [r.id, r.nama]) || []);

  // Sesuai studi kasus: Cek status dengan NOMOR + NAMA PEMINJAM (keduanya harus diisi & cocok)
  if (keywordNama && keywordId) {
    const { data, error } = await supabaseAdmin
      .from("peminjaman")
      .select("*")
      .eq("id", Number(keywordId))
      .ilike("peminjam", keywordNama); // Pencarian ketat berdasarkan ID dan Nama

    if (error) {
      errorMsg = error.message;
    } else {
      hasilPencarian = data || [];
    }
  } else if (keywordNama || keywordId) {
    errorMsg =
      "Mohon masukkan NOMOR ID Peminjaman dan NAMA PEMINJAM secara bersamaan untuk melakukan pengecekan.";
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-950">
        Cek Status Peminjaman
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Masukkan ID (Nomor) dan Nama Peminjam secara bersamaan untuk melacak
        status pengajuan secara akurat.
      </p>

      <form
        method="GET"
        action="/cek"
        className="mb-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row"
      >
        <input
          type="text"
          name="nama"
          defaultValue={keywordNama}
          required
          placeholder="Nama peminjam (contoh: Nadia)..."
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          type="number"
          name="id"
          defaultValue={keywordId}
          required
          placeholder="ID Peminjaman (contoh: 7)..."
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none sm:w-48"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Cek Status
        </button>
      </form>

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
          {errorMsg}
        </div>
      )}

      {keywordNama && keywordId && (
        <div>
          <p className="mb-4 text-sm text-slate-600">
            Menampilkan hasil pencarian ({hasilPencarian.length} ditemukan)
          </p>

          {hasilPencarian.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              Data peminjaman tidak ditemukan. Pastikan kombinasi ID dan Nama
              Peminjam sudah benar-benar cocok.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hasilPencarian.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div>
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
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
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
