import Link from "next/link";

import { H1 } from "@acme/ui/typography";

import { RegisterForm } from "../register-form";

export function RegisterView() {
  return (
    <div className="md:mt-[72px] h-screen justify-center mt-6 flex flex-col gap-y-14 px-6">
      <H1>Create your Account</H1>
      <RegisterForm />
      <div className="pb-8 text-center text-[15px] font-medium text-[#ACADB9]">
        Have an account?{" "}
        <Link href="/login" className="text-[#323142] hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
