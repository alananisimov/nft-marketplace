import Image from "next/image";

export function ProfileBackground() {
  return (
    <div className="relative">
      <div className="h-[208px] w-full bg-gradient-to-b from-[#090909] to-[#202020]" />
      <Image
        src="/profile-bg.png"
        alt=""
        width={200}
        height={400}
        className="absolute left-0 top-0 h-full w-full object-cover opacity-[0.035] saturate-0"
      />
    </div>
  );
}
