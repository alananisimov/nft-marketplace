import { Loader2Icon } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-screen">
      <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] transition-all duration-300 ease-in">
        <Loader2Icon className="size-8 animate-spin" />
      </div>
    </div>
  );
}
