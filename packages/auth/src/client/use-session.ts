"use client";

import { useCallback, useState } from "react";
import { getCookie, setCookie } from "cookies-next/client";

import { AUTH_COOKIE_NAME } from "../constants";
import type { AuthSession } from "../types";

function getSessionFromCookie(): AuthSession | null {
  const sessionData = getCookie(AUTH_COOKIE_NAME);
  if (!sessionData) return null;

  try {
    return JSON.parse(sessionData) as AuthSession;
  } catch {
    return null;
  }
}

function setSessionToCookie(session: AuthSession) {
  setCookie(AUTH_COOKIE_NAME, JSON.stringify(session));
}

export function useSession() {
  const [session, setSessionState] = useState<AuthSession | null>(
    getSessionFromCookie,
  );

  const setSession = useCallback((session: AuthSession) => {
    setSessionToCookie(session);
    setSessionState(session);
  }, []);

  return {
    session,
    setSession,
  };
}
