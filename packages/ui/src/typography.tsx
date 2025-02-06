import type { HTMLAttributes } from "react";

import { cn } from ".";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "blockquote";
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "body"
    | "muted"
    | "success"
    | "blockquote";
}

const variantStyles = {
  h1: "scroll-m-20 text-4xl font-semibold tracking-tight",
  h2: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h3: "scroll-m-20 text-[18px] font-medium tracking-tight",
  h4: "scroll-m-20 text-[14px] font-semibold tracking-tight",
  body: "leading-7",
  muted: "text-sm text-muted-foreground",
  success: "text-sm font-semibold text-[#007AFF]",
  blockquote: "mt-6 border-l-2 pl-6 italic",
};

const defaultElementMap = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  muted: "p",
  success: "p",
  blockquote: "blockquote",
} as const;

function Typography({
  as,
  variant,
  className,
  children,
  ...props
}: TypographyProps) {
  const Component = as ?? defaultElementMap[variant ?? "body"];
  const variantStyle = variant ? variantStyles[variant] : variantStyles.body;

  return (
    <Component className={cn(variantStyle, className)} {...props}>
      {children}
    </Component>
  );
}

export function H1(props: HTMLAttributes<HTMLHeadingElement>) {
  return <Typography variant="h1" {...props} />;
}

export function H2(props: HTMLAttributes<HTMLHeadingElement>) {
  return <Typography variant="h2" {...props} />;
}

export function H3(props: HTMLAttributes<HTMLHeadingElement>) {
  return <Typography variant="h3" {...props} />;
}

export function H4(props: HTMLAttributes<HTMLHeadingElement>) {
  return <Typography variant="h4" {...props} />;
}

export function Success(props: HTMLAttributes<HTMLHeadingElement>) {
  return <Typography variant="success" {...props} />;
}

export function TypographyP(props: HTMLAttributes<HTMLParagraphElement>) {
  return <Typography variant="body" {...props} />;
}

export function TypographyMuted(props: HTMLAttributes<HTMLParagraphElement>) {
  return <Typography variant="muted" {...props} />;
}

export function TypographyBlockquote(props: HTMLAttributes<HTMLQuoteElement>) {
  return <Typography variant="blockquote" {...props} />;
}

export function Hr(props: HTMLAttributes<HTMLHRElement>) {
  return <hr {...props} className="my-2.5" />;
}

export function TypographyList(props: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul {...props} className="ml-6 list-disc [&>li]:mt-2">
      {props.children}
    </ul>
  );
}

export function TypographyOl(props: HTMLAttributes<HTMLOListElement>) {
  return (
    <ol {...props} className="space-y-1">
      {props.children}
    </ol>
  );
}

export { Typography };
