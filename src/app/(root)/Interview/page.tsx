import Agent from "@/components/Agent";

function Page() {
  return (
    <div>
      <h3>Interview Generation</h3>
      <Agent
        userName="you"
        userId="123"
        interviewId="123"
        feedbackId="123"
        type="interview"
      />
    </div>
  );
}

export default Page;
