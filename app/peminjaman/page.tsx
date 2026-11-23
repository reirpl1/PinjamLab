import { supabasePublic } from "@/lib/supabase";

export default async function JadwalPublik() {
  const { data: peminjamanList } = await supabasePublic
    .from("peminjaman")
    .select("*, ruang(nama)")
    .eq("status", "disetujui")
    .order("tanggal", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Jadwal Publik Peminjaman Disetujui
      </h1>
      [cite: 3]
      <div className="space-y-4">
        {peminjamanList?.map((item) => (
          <div key={item.id} className="border p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg">{item.ruang?.nama}</h2>
            <p className="text-sm text-gray-600">
              <strong>Tanggal:</strong> {item.tanggal}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Waktu:</strong> {item.mulai} - {item.selesai}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Keperluan:</strong> {item.keperluan}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
