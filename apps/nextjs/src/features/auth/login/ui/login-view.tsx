import { H1 } from "@acme/ui/typography";

import { LoginForm } from "./login-form";
import { LoginLinks } from "./login-links";

export function LoginView() {
  return (
    <div className="mt-6 flex h-screen flex-col justify-center gap-y-14 px-6 md:mt-[142px]">
      <H1>Login your Account</H1>
      <LoginForm />
      <LoginLinks />
    </div>
  );
}
