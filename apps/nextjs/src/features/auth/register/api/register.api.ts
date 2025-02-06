"use client";

import { useRouter } from "next/navigation";

import { useSignIn } from "@acme/auth";

import type { TRegister } from "../model/register.types";
import { api } from "~/app/providers/trpc-provider/react";
import { useTelegramData } from "~/shared/hooks/use-tg-data";

interface RegisterApiOptions {
  redirect?: boolean;
  redirectTo?: string;
  autoLogin?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error | string) => void;
}

interface UseRegisterApiProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useRegisterApi({
  onSuccess,
  onError,
}: UseRegisterApiProps = {}) {
  const auth = useTelegramData();
  const { signIn } = useSignIn();
  const router = useRouter();

  const { mutateAsync } = api.auth.register.useMutation({
    onError: (e) => {
      onError?.(e.message);
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const register = async (
    formValues: TRegister,
    options: RegisterApiOptions = {},
  ) => {
    const {
      redirect = true,
      redirectTo = "/login",
      autoLogin = false,
    } = options;

    try {
      await mutateAsync({ ...formValues, telegramId: auth?.user.id ?? 0 });
    } catch (error) {
      console.log(error);
      return;
    }

    if (autoLogin) {
      await signIn({
        publicKey: formValues.publicKey,
        password: formValues.password,
        telegramId: auth?.user.id ?? 0,
      });
    }

    if (redirect) {
      router.push(redirectTo);
    }
  };

  return { register };
}
