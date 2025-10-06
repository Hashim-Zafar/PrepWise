"use server";
import { db, auth } from "../../../firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export const signUp = async (params: SignUpParams) => {
  const { uid, name, email } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "The user already exists",
      };
    }
    await db.collection("users").doc(uid).set({
      name,
      email,
    });

    return {
      success: true,
      message: "Account Created successfully , Please sign in",
    };
  } catch (err: any) {
    console.error("Error creating the user");

    if (err.code === "auth/email-already-exists") {
      return {
        success: false,
        message: err,
      };
    }
  }
};

export const setSessionCookies = async (idToken: string) => {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000, //Give the cookie duration of One week ,meaning the log in will last 7 days once signed in
  });
  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
};

export const signIn = async (params: SignInParams) => {
  try {
    const { email, idToken } = params;
    const user = await auth.getUserByEmail(email);
    if (!user) {
      return {
        success: false,
        message: "No user Found with this email , Create an account first",
      };
    }
    await setSessionCookies(idToken);
  } catch (err) {
    console.error(err);

    return {
      success: false,
      message: "Failed to log in please try again",
    };
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord) return null;
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

export const fetchUserInterviews = async (
  userId: string
): Promise<Interview[] | null> => {
  const interviews = await db
    .collection("Interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((interview) => ({
    id: interview.id,
    ...interview.data(),
  })) as Interview[];
};

export const fetchOtherInterviews = async (
  params: GetLatestInterviewsParams
) => {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("Interviews")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .orderBy("userId")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return interviews.docs.map((interview) => ({
    id: interview.id,
    ...interview.data(),
  })) as Interview[];
};
