"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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

import type { TRegister } from "../../model/register.types";
import { Icons } from "~/shared/ui/icons";
import { useRegisterApi } from "../../api/register.api";
import { RegisterSchema } from "../../model/register.schema";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();

  const { register } = useRegisterApi({
    onSuccess: () => {
      toast.success("Register successful");
    },
    onError: (e) => {
      toast.error("Failed to register", {
        description: e,
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      publicKey: "",
      password: "",
    },
  });

  function onSubmit(values: TRegister) {
    startTransition(async () => {
      await register(values, { redirectTo: "/", autoLogin: true });
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
              name="publicKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stellar Public Key</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Stellar Public Key"
                      disabled={isPending}
                      focusedIcon={<Icons.stellar className="size-[18px]" />}
                      icon={
                        <Icons.stellar_mono
                          fill="#C2C3CB"
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
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
