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
import { stellarKeySchema } from "../../model/reset-password.schema";
import type { StellarKeyFormData } from "../../model/reset-password.types";

interface StellarKeyFormProps {
  onSubmit: (data: StellarKeyFormData) => void;
}

export function StellarKeyForm({ onSubmit }: StellarKeyFormProps) {
  const form = useForm<StellarKeyFormData>({
    resolver: zodResolver(stellarKeySchema),
    defaultValues: {
      stellarKey: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="stellarKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enter your Stellar Public Key</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Stellar Key"
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
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  );
}
