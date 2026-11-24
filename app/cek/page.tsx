import { supabasePublic } from "@/lib/supabase";

export const instant = false;

export default async function CekStatus({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; nama?: string }>;
}) {
  const resolvedParams = await searchParams;
  const id = resolvedParams.id;
  const nama = resolvedParams.nama;

  let hasil = null;
  if (id && nama) {
    const { data } = await supabasePublic
      .from("peminjaman")
      .select("*, ruang(nama)")
      .eq("id", id)
      .ilike("peminjam", nama)
      .single();
    hasil = data;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Cek Status Peminjaman</h1>
      <form method="GET" className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium">
            {" "}
            Nomor Peminjam (ID)
          </label>
          <input
            type="number"
            name="id"
            defaultValue={id || ""}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Nama Peminjam</label>
          <input
            type="text"
            name="nama"
            defaultValue={nama || ""}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Cek Status
        </button>
      </form>

      {hasil && (
        <div className="border p-4 rounded bg-gray-50 space-y-2">
          <p>
            <strong>Ruangan:</strong> {hasil.ruang?.nama}
          </p>
          <p>
            <strong>Tanggal:</strong> {hasil.tanggal}
          </p>
          <p>
            <strong>Waktu:</strong> {hasil.mulai} - {hasil.selesai}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="uppercase font-semibold">{hasil.status}</span>
          </p>
          {hasil.status === "ditolak" && (
            <p className="text-red-600">
              <strong>Alasan Ditolak:</strong> {hasil.alasan_tolak}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
