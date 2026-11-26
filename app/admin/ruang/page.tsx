import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const instant = false;

// 1. Definisikan Server Actions di luar komponen utama
async function tambahRuang(formData: FormData) {
  "use server";
  const nama = formData.get("nama") as string;
  const jenis = formData.get("jenis") as string;
  const kapasitas = Number(formData.get("kapasitas"));
  const lokasi = formData.get("lokasi") as string;

  if (!nama || !jenis || !kapasitas || !lokasi) {
    throw new Error("Semua field wajib diisi untuk menambah ruangan.");
  }

  const { error } = await supabaseAdmin.from("ruang").insert([
    {
      nama,
      jenis,
      kapasitas,
      lokasi,
      aktif: true, // Default aktif saat dibuat
    },
  ]);

  if (error) {
    throw new Error("Gagal menambah ruangan: " + error.message);
  }

  revalidatePath("/admin/ruang");
  revalidatePath("/ruang");
}

async function toggleAktif(formData: FormData) {
  "use server";
  const id = formData.get("id");
  const statusAktif = formData.get("aktif") === "true";

  const { error } = await supabaseAdmin
    .from("ruang")
    .update({ aktif: !statusAktif })
    .eq("id", id);

  if (error) {
    throw new Error("Gagal memperbarui status ruangan: " + error.message);
  }

  revalidatePath("/admin/ruang");
  revalidatePath("/ruang");
}

async function hapusRuang(formData: FormData) {
  "use server";
  const id = formData.get("id");

  const { error } = await supabaseAdmin.from("ruang").delete().eq("id", id);

  if (error) {
    throw new Error(
      "Gagal menghapus ruangan. Pastikan tidak ada riwayat peminjaman terkait.",
    );
  }

  revalidatePath("/admin/ruang");
  revalidatePath("/ruang");
}

export default async function AdminRuangPage() {
  // Ambil seluruh data ruangan dari database
  const { data: ruangList, error } = await supabaseAdmin
    .from("ruang")
    .select("*")
    .order("nama", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header & Navigasi Kembali */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Manajemen Ruangan
          </h1>
          <p className="text-sm text-slate-500">
            Tambah, aktifkan, nonaktifkan, atau hapus fasilitas ruang dan
            laboratorium.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Kembali ke Panel Permohonan
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal memuat data ruangan: {error.message}
        </div>
      )}

      {/* Grid Utama: Form Tambah di Kiri, Daftar Ruang di Kanan */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form Tambah Ruangan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs h-fit">
          <h2 className="mb-4 text-base font-bold text-slate-900">
            Tambah Ruangan Baru
          </h2>

          <form action={tambahRuang} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Nama Ruangan
              </label>
              <input
                type="text"
                name="nama"
                required
                placeholder="Contoh: Lab Komputer 3"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Jenis Ruangan
              </label>
              <select
                name="jenis"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 bg-white"
              >
                <option value="lab">Lab</option>
                <option value="kelas">Kelas</option>
                <option value="aula">Aula</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Kapasitas Maksimal (Orang)
              </label>
              <input
                type="number"
                name="kapasitas"
                min={1}
                required
                placeholder="Contoh: 35"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Lokasi Gedung / Lantai
              </label>
              <input
                type="text"
                name="lokasi"
                required
                placeholder="Contoh: Gedung A Lantai 2"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Simpan Ruangan Baru
            </button>
          </form>
        </div>

        {/* Daftar Ruangan yang Ada */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Daftar Ruangan Terdaftar ({ruangList?.length ?? 0})
          </h2>

          {ruangList && ruangList.length > 0 ? (
            <div className="space-y-3">
              {ruangList.map((ruang) => (
                <div
                  key={ruang.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                        {ruang.jenis}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          ruang.aktif
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {ruang.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {ruang.nama}
                    </h3>
                    <p className="text-xs text-slate-500">
                      📍 {ruang.lokasi} • Kapasitas: {ruang.kapasitas} orang
                    </p>
                  </div>

                  {/* Tombol Aksi Admin: Aktifkan/Nonaktifkan & Hapus */}
                  <div className="flex items-center gap-2">
                    {/* Form Toggle Aktif / Nonaktif */}
                    <form action={toggleAktif}>
                      <input type="hidden" name="id" value={ruang.id} />
                      <input
                        type="hidden"
                        name="aktif"
                        value={String(ruang.aktif)}
                      />
                      <button
                        type="submit"
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          ruang.aktif
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        }`}
                      >
                        {ruang.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>

                    {/* Form Hapus Ruangan */}
                    <form action={hapusRuang}>
                      <input type="hidden" name="id" value={ruang.id} />
                      <button
                        type="submit"
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
                      >
                        Hapus
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-xs text-slate-500">
              Belum ada data ruangan terdaftar di database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
