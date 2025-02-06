import Link from "next/link";

export function LoginLinks() {
  return (
    <div className="flex flex-col gap-y-2 pb-8">
      <div className="text-center text-[15px] font-medium text-[#ACADB9]">
        Forgot password?{" "}
        <Link href="/reset-password" className="text-[#323142] hover:underline">
          Reset Password
        </Link>
      </div>
      <div className="text-center text-[15px] font-medium text-[#ACADB9]">
        Don't have an account?{" "}
        <Link href="/register" className="text-[#323142] hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
