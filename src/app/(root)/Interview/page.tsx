import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.actions";

async function Page() {
  const user = await getCurrentUser();
  return (
    <div>
      <h3>Interview Generation</h3>
      <Agent userName={user?.name!} userId={user?.id} type="generate" />
    </div>
  );
}

export default Page;
