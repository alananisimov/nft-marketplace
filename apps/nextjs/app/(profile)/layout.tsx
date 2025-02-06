import type { ReactNode } from "react";

interface ProfileProps {
  children: ReactNode;
  modal: React.ReactNode;
}

export default function ProfileLayout({ children, modal }: ProfileProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
