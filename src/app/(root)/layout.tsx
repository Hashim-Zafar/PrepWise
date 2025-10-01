import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/actions/auth.actions";
import { redirect } from "next/navigation";
async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const isSignedIn = await isAuthenticated();
  if (!isSignedIn) redirect("/sign-in");
  return (
    <div className="root-layout">
      <nav>
        <Link href={"/"} className="flex items-center gap-2">
          <Image src={"/logo.svg"} alt="Logo" width={28} height={32} />
          <h2 className="text-primary-100">PrepWise</h2>
        </Link>
      </nav>
      {children}
    </div>
  );
}

export default Layout;
