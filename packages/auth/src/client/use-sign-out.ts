"use client";

import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next/client";

import { AUTH_COOKIE_NAME } from "../constants";

export function useSignOut() {
  const router = useRouter();
  const signOut = () => {
    deleteCookie(AUTH_COOKIE_NAME);
    router.push("/login");
  };

  return {
    signOut,
  };
}
