import { z } from "zod";
import { isAuthenticated } from "@/lib/actions/auth.actions";
const formSchema = z.object({
  username: z.string().min(2).max(50),
});
import { ReactNode } from "react";
import { redirect } from "next/navigation";

async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const isSignedIn = await isAuthenticated();
  if (isSignedIn) redirect("/");
  return <div className="auth-layout">{children}</div>;
}

export default Layout;
