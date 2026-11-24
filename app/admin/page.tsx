import { supabasePublic, supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export const instant = false;

export default async function AdminPanel() {
  const { data: permohonanList } = await supabasePublic
    .from("peminjaman")
    .select("*, ruang(nama)")
    .order("dibuat", { ascending: false });

  async function updateStatus(formData: FormData) {
    "use server";
    const id = formData.get("id");
    const status = formData.get("status") as string;
    const alasan_tolak = formData.get("alasan_tolak") as string;

    if (status === "ditolak" && (!alasan_tolak || alasan_tolak.length < 5)) {
      throw new Error("Penolakan wajib disertai alasan minimal 5 karakter.");
    }

    await supabaseAdmin
      .from("peminjaman")
      .update({
        status,
        alasan_tolak: status === "ditolak" ? alasan_tolak : null,
      })
      .eq("id", id);

    revalidatePath("/admin");
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Panel Admin - Persetujuan Peminjaman
      </h1>

      <div className="space-y-4">
        {permohonanList?.map((item) => (
          <div
            key={item.id}
            className="border p-4 rounded-lg shadow bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h2 className="font-bold text-lg">{item.ruang?.nama}</h2>
              <p className="text-sm">
                Peminjam: {item.peminjam} ({item.jumlah_orang} orang)
              </p>
              <p className="text-sm">Keperluan: {item.keperluan}</p>
              <p className="text-sm">
                Waktu: {item.tanggal} | {item.mulai} - {item.selesai}
              </p>
              <p className="text-sm mt-1">
                Status:{" "}
                <span className="uppercase font-semibold px-2 py-0.5 bg-gray-100 rounded">
                  {item.status}
                </span>
              </p>
            </div>

            <form
              action={updateStatus}
              className="flex flex-col gap-2 w-full md:w-auto"
            >
              <input type="hidden" name="id" value={item.id} />
              {item.status === "menunggu" && (
                <>
                  <button
                    name="status"
                    value="disetujui"
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                  >
                    Setujui
                  </button>
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      name="alasan_tolak"
                      placeholder="Alasan tolak (min 5 huruf)"
                      className="border p-1 text-sm rounded"
                    />
                    <button
                      name="status"
                      value="ditolak"
                      className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                    >
                      Tolak
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
