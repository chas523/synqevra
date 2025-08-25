"use client";

import { logout } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <form action={logout}>
          <Button type="submit" variant="outline" className='cursor-pointer'>
            Log out
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border p-6">
        <p className="text-sm text-muted-foreground">
        </p>
        <p className="mt-2">
          This is a protected page. You can put your app content here.
        </p>
      </div>
    </div>
  );
}
