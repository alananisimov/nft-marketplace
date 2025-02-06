"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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

import { Icons } from "~/shared/ui/icons";
import { passwordSchema } from "../../model/reset-password.schema";
import type { PasswordFormData } from "../../model/reset-password.types";

interface NewPasswordFormProps {
  onSubmit: (data: PasswordFormData) => void;
  isLoading: boolean;
}

export function NewPasswordForm({ onSubmit, isLoading }: NewPasswordFormProps) {
  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Password"
                  focusedIcon={<Icons.lock className="size-[18px]" />}
                  icon={<Icons.lock_mono className="size-[18px]" />}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Confirm password"
                  focusedIcon={<Icons.lock className="size-[18px]" />}
                  icon={<Icons.lock_mono className="size-[18px]" />}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
}
