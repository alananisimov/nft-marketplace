import { H1 } from "@acme/ui/typography";

import { LoginForm } from "./login-form";
import { LoginLinks } from "./login-links";

export function LoginView() {
  return (
    <div className="md:mt-[142px] h-screen justify-center mt-6 flex flex-col gap-y-14 px-6">
      <H1>Login your Account</H1>
      <LoginForm />
      <LoginLinks />
    </div>
  );
}
