import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Management System - Sign In",
  description: "Sign in to access your event management dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}