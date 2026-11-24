import { supabasePublic, supabaseAdmin } from "@/lib/supabase";
import { redirect } from "next/navigation";

export const instant = false;

export default async function FormPinjam() {
  const { data: ruangList } = await supabasePublic
    .from("ruang")
    .select("id, nama, kapasitas")
    .eq("aktif", true);

  async function handleAction(formData: FormData) {
    "use server";

    const ruang_id = formData.get("ruang_id");
    const peminjam = formData.get("peminjam") as string;
    const keperluan = formData.get("keperluan") as string;
    const tanggal = formData.get("tanggal") as string;
    const mulai = formData.get("mulai") as string;
    const selesai = formData.get("selesai") as string;
    const jumlah_orang = Number(formData.get("jumlah_orang"));

    // Validasi aturan bisnis di server
    if (!peminjam || peminjam.length < 3 || peminjam.length > 40) {
      throw new Error("Nama peminjam wajib diisi (3-40 karakter).");
    }
    if (!keperluan || keperluan.length < 5 || keperluan.length > 120) {
      throw new Error("Keperluan wajib diisi (5-120 karakter).");
    }
    if (mulai < "07:00" || selesai > "17:00") {
      throw new Error("Jam operasional adalah pukul 07:00 - 17:00.");
    }

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
      throw new Error("Gagal mengajukan peminjaman: " + error.message);
    }

    redirect("/peminjaman");
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Formulir Pengajuan Peminjaman Ruang
      </h1>
      <form action={handleAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Pilih Ruangan</label>
          <select
            name="ruang_id"
            required
            className="w-full border p-2 rounded"
          >
            {ruangList?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nama} (Kapasitas: {r.kapasitas})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Nama Peminjam (3-40 karakter)
          </label>
          <input
            type="text"
            name="peminjam"
            required
            minLength={3}
            maxLength={40}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Keperluan (5-120 karakter)
          </label>
          <textarea
            name="keperluan"
            required
            minLength={5}
            maxLength={120}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Tanggal</label>
          <input
            type="date"
            name="tanggal"
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Jam Mulai</label>
            <input
              type="time"
              name="mulai"
              required
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Jam Selesai</label>
            <input
              type="time"
              name="selesai"
              required
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Jumlah Orang</label>
          <input
            type="number"
            name="jumlah_orang"
            min={1}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Ajukan Peminjaman
        </button>
      </form>
    </div>
  );
}
