import { db } from "../../../firebase/admin";

export const getInterviewById = async (
  interviewId: string
): Promise<Interview | null> => {
  const userInterview = await db
    .collection("Interviews")
    .doc(interviewId)
    .get();

  return {
    ...userInterview.data(),
  } as Interview | null;
};
