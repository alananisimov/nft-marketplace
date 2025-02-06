"use client";

import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@acme/ui/form";

import type { TDeliveryForm } from "../../model/delivery.types";
import type { TNFT } from "~/entities/nft/model/nft.types";
import { DeliveryFormSchema } from "../../model/delivery.schema";
import { DeliveryFormInput } from "./form-input";
import { Image } from "~/shared/ui/image";

interface DeliveryFormProps {
  nft?: TNFT;
  onSubmit: (data: TDeliveryForm) => Promise<void>;
  onBack: () => void;
}

export function DeliveryForm({ nft, onSubmit }: DeliveryFormProps) {
  const form = useForm<z.infer<typeof DeliveryFormSchema>>({
    resolver: zodResolver(DeliveryFormSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      additionalAddress: "",
      state: "",
      postalCode: "",
      additionalState: "",
      countryCode: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-8 p-4"
      >
        <div className="flow-row mx-auto mt-4 flex items-center gap-x-[9px]">
          <Avatar>
            <AvatarFallback />
            <Image
              src={nft?.image ?? ""}
              alt={nft?.name ?? "NFT"}
              height={64}
              width={64}
              className="aspect-square h-full w-full"
            />
          </Avatar>
          <div className="flex flex-col justify-between text-left">
            <span className="text-[16px] font-medium">{nft?.name}</span>
            <p className="text-muted-foreground">{nft?.description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DeliveryFormInput placeholder="Recipient Name" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DeliveryFormInput placeholder="Email" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DeliveryFormInput
                    placeholder="Shipping address"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalAddress"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DeliveryFormInput
                    placeholder="Additional Street Field"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row justify-between gap-x-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DeliveryFormInput placeholder="e. g. Chicago" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalState"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DeliveryFormInput placeholder="e.g" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row justify-between gap-x-4">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DeliveryFormInput placeholder="60612" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DeliveryFormInput placeholder="US" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div>
          <Button size="light" variant="light" className="w-full">
            Confirm
          </Button>
        </div>
      </form>
    </Form>
  );
}
