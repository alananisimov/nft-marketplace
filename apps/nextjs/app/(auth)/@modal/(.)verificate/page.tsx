import { VerificationDrawerWrapper } from "~/features/auth/verification/ui/verification-drawer";

interface VerificateModalProps {
  searchParams: Promise<{
    publicKey: string;
  }>;
}

export default async function VerificateModal({
  searchParams,
}: VerificateModalProps) {
  const params = await searchParams;
  return <VerificationDrawerWrapper publicKey={params.publicKey} />;
}
