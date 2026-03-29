"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="px-4 py-2 rounded-xl bg-red-600 text-white"
    >
      Logout
    </button>
  );
}