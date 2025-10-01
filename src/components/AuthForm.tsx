"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/client";
import { signUp } from "@/lib/actions/auth.actions";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signIn } from "@/lib/actions/auth.actions";

const authSchema = (type: "sign-in" | "sign-up") => {
  return z.object({
    email: z
      .string()
      .min(6, "Email is required")
      .email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name:
      type === "sign-up"
        ? z.string().min(2, "Name is required")
        : z.string().optional(),
  });
};
function AuthForm({ type }: { type: "sign-in" | "sign-up" }) {
  const router = useRouter();

  const formSchema = authSchema(type);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(authSchema(type)),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-in") {
        const { name, email, password } = values;
        const userCredentials = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const idToken = await userCredentials.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed  Please try again ");
          return;
        }

        await signIn({
          idToken,
          email,
        });
        router.push("/");
        toast.success("Signed in successfully");
      } else {
        //If the type is Sign Up and then de structure the values
        const { name, email, password } = values;
        //Create the user with in Firebase auth
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        //Then register the user on the Firebase Database
        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!, // adding ! means assuring TS that we will have a name and it will not be undefined
          email,
          password,
        });
        //Toast the error if Sign up fails
        if (!result!.success) {
          toast.error(result?.message);
          return;
        }
        toast.success("Account created successfully , Please Sign in");
        router.push("/sign-in");
      }
    } catch (error) {
      console.error(error);
      toast.error("something went wrong" + error);
    }
  }

  const isSignIn = type === "sign-in";
  return (
    <div className="card-border lg:min-w-[566px]">
      {" "}
      {/* Parent Div */}
      <div className="flex flex-col gap-6 py-14 px-10 card">
        {" "}
        {/* Logo Container */}
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="Logo" width={32} height={28} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>
        <h3>Practice Job interview with PrepWise</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                lable="Name"
                placeholder="Enter your name"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              lable="Email"
              placeholder="Enter your email"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              lable="Password"
              placeholder="Enter your password"
              type="password"
            />
            <Button type="submit" className="btn">
              {isSignIn ? "Sign in" : "Create an account"}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="text-bold text-primary-200 ml-1"
          >
            {isSignIn ? " Sign up" : " Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
