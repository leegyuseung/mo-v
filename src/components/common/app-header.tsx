import Image from "next/image";
import Link from "next/link";

export default function AppHeader() {
  return (
    <div className="flex h-16 w-full bg-white">
      <Link href={"/"}>
        <Image
          src={"/logo.png"}
          alt=""
          height={64}
          width={64}
          className="cursor-pointer"
        />
      </Link>
    </div>
  );
}
