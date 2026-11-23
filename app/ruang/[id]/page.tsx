import { supabasePublic } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function DetailRuangan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const ruangId = resolvedParams.id;

  // ambil data ruang
  const { data: ruang } = await supabasePublic
    .from("ruang")
    .select("*")
    .eq("id", ruangId)
    .single();

  if (!ruang) notFound();

  // ambil jadwal yang sudah disetujui untuk ruangan ini (TANPA nama pemminjam)
  const { data: jadwalList } = await supabasePublic
    .from("peminjaman")
    .select("tanggal, mulai, selesai, keperluan")
    .eq("ruang__id", ruangId)
    .order("tanggal", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{ruang.nama}</h1>
      <p className="text-gray-600 uppercase mb-4">
        Jenis: {ruang.jenis} | Kapasitas: {ruang.kapasitas} orang
      </p>
      <p className="text-gray-600 mb-6">Lokasi: {ruang.lokasi}</p>

      <h2 className="text-xl font-semibold mb-3">Jadwal Ruangan Disetujui</h2>
      {jadwalList && jadwalList.length > 0 ? (
        <div className="space-y-3">
          {jadwalList.map((j, idx) => (
            <div key={idx} className="border p-4 rounded bg-gray-50">
              <p>
                <strong>Tanggal:</strong> {j.tanggal}
              </p>
              <p>
                <strong>Waktu:</strong> {j.mulai} - {j.selesai}
              </p>
              <p>
                <strong>Keperluan:</strong> {j.keperluan}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          Belum ada jadwal peminjaman yang disetujui untuk ruangan ini.
        </p>
      )}
    </div>
  );
}
