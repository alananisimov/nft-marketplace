"use client";

import { useRouter } from "next/navigation";

import type { AuthErrorType } from "@acme/auth";
import { useSignIn } from "@acme/auth";

import type { TLogin } from "../model/login.types";
import { useTelegramData } from "~/shared/hooks/use-tg-data";

interface LoginApiOptions {
  redirect?: boolean;
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: Error | string) => void;
}

interface UseLoginApiProps {
  onSuccess?: () => void;
  onError?: (error: string, errorType?: AuthErrorType) => void;
}

export function useAutoLoginApi({
  onSuccess: globalOnSuccess,
  onError: globalOnError,
}: UseLoginApiProps = {}) {
  const initData = useTelegramData();
  const router = useRouter();
  const { signIn } = useSignIn();

  const handleAutoLogin = async (
    options: LoginApiOptions = {},
  ) => {
    const {
      redirect = true,
      redirectTo = "/",
      onSuccess: localOnSuccess,
      onError: localOnError,
    } = options;

    try {
      const result = await signIn({
        publicKey: formValues.stellar_key,
        telegramId: initData?.user.id ?? 0,
        password: formValues.password,
      });

      if (result.error) {
        localOnError?.(result.error);
        globalOnError?.(result.error, result.errorType);
        return false;
      }

      console.log("Login successful");
      localOnSuccess?.();
      globalOnSuccess?.();

      if (redirect) {
        router.push(redirectTo);
      }
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      localOnError?.(errorMessage);
      globalOnError?.(errorMessage);
      return false;
    }
  };

  return { login: handleLogin };
}

