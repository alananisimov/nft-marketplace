interface MarketLayoutProps {
  children: React.ReactNode;
}

export function MarketLayout({ children }: MarketLayoutProps) {
  return <main className="pb-6 pl-6">{children}</main>;
}
