import { authMiddleware } from "@acme/auth/middleware";

export const middleware = authMiddleware();

export const config = {
  matcher: ["/me", "/confirm-withdraw", "/"],
};
