import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";

export function ProfileAvatar({ profilePhoto }: { profilePhoto?: string }) {
  return (
    <Avatar className="size-[calc(7rem+22px)] border-[11px] border-white">
      <AvatarFallback />
      <AvatarImage src={profilePhoto ?? "/avatar.png"} />
    </Avatar>
  );
}
