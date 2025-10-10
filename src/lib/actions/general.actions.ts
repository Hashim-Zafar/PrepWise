"use server";

import { google } from "@ai-sdk/google";
import { db } from "../../../firebase/admin";
import { generateObject } from "ai";
import { feedbackSchema } from "../../../constants";

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

export const createFeedback = async (params: CreateFeedbackParams) => {
  const { interviewId, userId, transcript, feedbackId } = params;
  try {
    const formattedTranscript = transcript.map((sentence) => {
      return ` - ${sentence.role}: ${sentence.content}`;
    });
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = await db.collection("feedback").add({
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    });
    return {
      success: true,
      feedbackId: feedback.id,
    };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return {
      success: false,
    };
  }
};

export const getFeedbackById = async (
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> => {
  const { interviewId, userId } = params;

  const feedback = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (feedback.empty) return null;

  const feedbackDoc = feedback.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
};
