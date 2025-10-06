import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { dummyInterviews } from "../../../constants";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  fetchUserInterviews,
  fetchOtherInterviews,
} from "@/lib/actions/auth.actions";

async function Page() {
  const user = await getCurrentUser();
  const [userInterviews, otherInterviews] = await Promise.all([
    fetchUserInterviews(user?.id!),
    fetchOtherInterviews({ userId: user?.id! }),
  ]);
  const pastUserInterviews = (userInterviews?.length ?? 0) > 0;
  const hasOtherInterviews = (otherInterviews?.length ?? 0) > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col max-w-lg gap-6">
          <h2>Get Interview Ready with AI Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/Interview">Get Started</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="robo-dude"
          className="max-sm:hidden"
          width={400}
          height={400}
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {pastUserInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard key={interview.id} {...interview} />
            ))
          ) : (
            <p>You haven't taken any interview yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>

        <div className="interviews-section">
          {hasOtherInterviews ? (
            otherInterviews.map((interview) => (
              <InterviewCard key={interview.id} {...interview} />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
          {/* <p>There are no interviews available</p> */}
        </div>
      </section>
    </>
  );
}

export default Page;
