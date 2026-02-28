import Image from "next/image";
import Link from "next/link";

export default function LogoOnlyHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-gray-100 bg-white px-4">
      <div className="mx-auto flex w-full max-w-6xl items-center">
        <Link href="/" aria-label="홈으로 이동">
          <Image src="/logo.png" alt="mo-v logo" width={72} height={72} priority className="cursor-pointer" />
        </Link>
      </div>
    </header>
  );
}
