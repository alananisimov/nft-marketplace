"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetAtom } from "jotai";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";

import type { TLogin } from "../model/login.types";
import { Icons } from "~/shared/ui/icons";
import { useLoginApi } from "../api/login.api";
import { LoginSchema } from "../model/login.schema";
import { loginState } from "../state/login-state";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const setLoginState = useSetAtom(loginState);
  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      stellar_key: "",
      password: "",
    },
  });
  const { login } = useLoginApi({
    onSuccess: () => {
      toast.success("Login successful");
    },
    onError: (e, errorType) => {
      if (errorType === "VERIFICATION_REQUIRED") {
        router.push(`/verificate?publicKey=${form.getValues().stellar_key}`);
      }

      if (errorType === "NOT_FOUND") {
        toast.error("Please verify your credentials");
      } else {
        toast.error("Failed to login", {
          description: e,
        });
      }
    },
  });

  function onSubmit(values: TLogin) {
    startTransition(async () => {
      setLoginState({
        stellarKey: values.stellar_key,
        password: values.password,
      });
      await login(values);
    });
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-[14px]"
      >
        <div className="flex flex-col gap-y-[26px]">
          <div className="flex flex-col gap-y-[18px]">
            <FormField
              control={form.control}
              name="stellar_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stellar Key</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Stellar Key"
                      disabled={isPending}
                      focusedIcon={<Icons.stellar className="size-[18px]" />}
                      icon={
                        <Icons.stellar_mono
                          fill="color(display-p3 0.7608 0.7647 0.7961)"
                          className="size-[18px]"
                        />
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Password"
                      focusedIcon={<Icons.lock className="size-[18px]" />}
                      icon={<Icons.lock_mono className="size-[18px]" />}
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
