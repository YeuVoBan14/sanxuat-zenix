import Image from "next/image";
import Link from "next/link";

export const SideBarLogo = () => {
  return (
    <Link href={"/admin"}>
      <Image
        width={60}
        alt="logo"
        className="max-w-[180px] mx-auto "
        height={190}
        src="/logo-mega.png"
        layout="responsive"
        quality={100}
      />
    </Link>
  );
};
