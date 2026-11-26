import { supabasePublic, supabaseAdmin } from "@/lib/supabase";
import { redirect } from "next/navigation";

export const instant = false;

export default async function FormPinjam({
  searchParams,
}: {
  searchParams: Promise<{ ruang_id?: string; error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const selectedRuangId = resolvedParams?.ruang_id;
  const errorMessage = resolvedParams?.error;

  // 1. Ambil data ruang langsung dari database Supabase
  const { data: ruangList, error: errorRuang } = await supabasePublic
    .from("ruang")
    .select("id, nama, kapasitas, aktif")
    .eq("aktif", true);

  // Server Action untuk memproses pengajuan
  async function handleAction(formData: FormData) {
    "use server";

    const ruang_id = formData.get("ruang_id");
    const peminjam = formData.get("peminjam") as string;
    const keperluan = formData.get("keperluan") as string;
    const tanggal = formData.get("tanggal") as string;
    const mulai = formData.get("mulai") as string;
    const selesai = formData.get("selesai") as string;
    const jumlah_orang = Number(formData.get("jumlah_orang"));

    // Validasi aturan bisnis (Kirim kembali pesan ramah via parameter URL jika gagal)
    if (!peminjam || peminjam.length < 3 || peminjam.length > 40) {
      redirect(
        `/pinjam?error=${encodeURIComponent("Nama peminjam wajib diisi antara 3 sampai 40 karakter.")}`,
      );
    }
    if (!keperluan || keperluan.length < 5 || keperluan.length > 120) {
      redirect(
        `/pinjam?error=${encodeURIComponent("Keperluan wajib diisi antara 5 sampai 120 karakter.")}`,
      );
    }
    if (mulai < "07:00" || selesai > "17:00") {
      redirect(
        `/pinjam?error=${encodeURIComponent("⚠️ Mohon maaf, jam operasional peminjaman ruangan adalah pukul 07:00 - 17:00.")}`,
      );
    }

    // Simpan ke database menggunakan supabaseAdmin agar bypass RLS
    const { error } = await supabaseAdmin.from("peminjaman").insert([
      {
        ruang_id,
        peminjam,
        keperluan,
        tanggal,
        mulai,
        selesai,
        jumlah_orang,
        status: "menunggu",
      },
    ]);

    if (error) {
      redirect(
        `/pinjam?error=${encodeURIComponent("Gagal mengajukan peminjaman: " + error.message)}`,
      );
    }

    redirect("/peminjaman");
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Formulir Pengajuan Peminjaman Ruang
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Silakan isi formulir di bawah ini. Pastikan jam peminjaman berada di
        dalam jam operasional sekolah (07:00 - 17:00).
      </p>

      {/* Kotak Pesan Peringatan Ramah jika ada error */}
      {errorMessage && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
          {decodeURIComponent(errorMessage)}
        </div>
      )}

      {errorRuang ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Gagal memuat daftar ruangan dari database.
        </div>
      ) : (
        <form action={handleAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Pilih Ruangan
            </label>
            <select
              name="ruang_id"
              required
              defaultValue={selectedRuangId || ""}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="" disabled>
                -- Pilih Ruangan yang Tersedia --
              </option>
              {ruangList?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama} (Kapasitas Maksimal: {r.kapasitas} orang)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nama Peminjam (3-40 karakter)
            </label>
            <input
              type="text"
              name="peminjam"
              required
              minLength={3}
              maxLength={40}
              placeholder="Contoh: Budi Santoso"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Keperluan (5-120 karakter)
            </label>
            <textarea
              name="keperluan"
              required
              minLength={5}
              maxLength={120}
              placeholder="Contoh: Praktikum Pemrograman Web Kelas XI"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Tanggal Peminjaman
            </label>
            <input
              type="date"
              name="tanggal"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Jam Mulai
              </label>
              <input
                type="time"
                name="time"
                // @ts-ignore
                name="mulai"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Jam Selesai
              </label>
              <input
                type="time"
                name="selesai"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Jumlah Orang (Peserta)
            </label>
            <input
              type="number"
              name="jumlah_orang"
              min={1}
              required
              placeholder="Contoh: 30"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Ajukan Peminjaman
          </button>
        </form>
      )}
    </div>
  );
}
