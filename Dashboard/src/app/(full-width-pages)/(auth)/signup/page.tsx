import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Management System - Create Account",
  description: "Create an account to start organizing and discovering events",
};

export default function SignUp() {
  return <SignUpForm />;
}