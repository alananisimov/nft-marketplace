import type { JwtPayload } from "jwt-decode";
import { jwtDecode } from "jwt-decode";

import { AUTH_ERRORS, TOKEN_BUFFER_TIME } from "../constants";
import { AuthError } from "../errors";

interface CustomJwtPayload extends JwtPayload {
  userId: string;
  telegramId: number;
  publicKey: string;
}

export class TokenUtils {
  static decode(token: string): CustomJwtPayload {
    try {
      return jwtDecode<CustomJwtPayload>(token);
    } catch {
      throw new AuthError("Invalid token format", AUTH_ERRORS.UNAUTHORIZED);
    }
  }

  static isExpired(token: string): boolean {
    try {
      const decoded = this.decode(token);
      if (!decoded.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime >= decoded.exp - TOKEN_BUFFER_TIME;
    } catch {
      return true;
    }
  }

  static getExpirationTime(token: string): number | null {
    try {
      const decoded = this.decode(token);
      return decoded.exp ?? null;
    } catch {
      return null;
    }
  }
}
