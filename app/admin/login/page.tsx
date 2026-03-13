import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminContext } from "@/lib/supabase/auth";

export default async function AdminLoginPage() {
  const adminContext = await getAdminContext();
  if (adminContext) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center px-4">
      <AdminLoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Customer account?{" "}
        <Link href="/member/login" className="font-medium text-primary">
          Login here
        </Link>
      </p>
    </main>
  );
}
