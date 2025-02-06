export type VerificationState =
  | { status: "idle" }
  | { status: "creating" }
  | { status: "awaiting_payment"; verification: TVerification }
  | { status: "verifying" }
  | { status: "linking_telegram" }
  | { status: "logging_in" }
  | { status: "completed" }
  | { status: "error"; error: string };

export interface TVerification {
  id: string;
  walletAddress: string;
  memo: string;
  expiresAt: Date;
}

export interface VerificationContextType {
  state: VerificationState;
  verification: TVerification | null;
  isLoading: boolean;
  createVerification: () => Promise<void>;
  handleVerificationSuccess: () => Promise<void>;
  handleClose: () => void;
}
