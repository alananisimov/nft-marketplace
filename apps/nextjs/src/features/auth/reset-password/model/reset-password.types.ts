export interface ResetPasswordStatus {
  success: boolean;
}

export type RecoveryStep = "stellar-key" | "verification" | "new-password";

export interface StellarKeyFormData {
  stellarKey: string;
}

export interface PasswordFormData {
  password: string;
  confirmPassword: string;
}
