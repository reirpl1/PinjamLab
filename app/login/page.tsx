import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";
    const password = formData.get("password") as string;

    // Ambil password murni dari environment variable, tanpa fallback string di kode
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      throw new Error("Konfigurasi ADMIN_PASSWORD belum disetel di server.");
    }

    if (password === correctPassword) {
      const cookieStore = await cookies();
      cookieStore.set("admin_logged_in", "true", { httpOnly: true, path: "/" });
      redirect("/admin");
    } else {
      throw new Error("Kata sandi salah!");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded-lg shadow bg-white">
      <h1 className="text-2xl font-bold mb-4">Login Admin PinjamLab</h1>
      <form action={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Kata Sandi Admin
          </label>
          <input
            type="password"
            name="password"
            required
            placeholder="Masukkan kata sandi..."
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Masuk
        </button>
      </form>
    </div>
  );
}
