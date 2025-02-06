import { cn } from "@acme/ui";

export function DeliveryFormInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border-[1.5px] border-black px-4 py-[9px]",
        "placeholder:text-[#64748B]/50 focus:outline-0",
        className,
      )}
      {...props}
    />
  );
}
