import { CheckIcon } from "lucide-react";

export function VerificationStatus({ isVerified }: { isVerified?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 ${isVerified ? "text-green-500" : "text-yellow-500"}`}
    >
      {isVerified ? (
        <>
          <CheckIcon className="h-5 w-5" />
          <span>Verified</span>
        </>
      ) : (
        <span>Awaiting Confirmation</span>
      )}
    </div>
  );
}
