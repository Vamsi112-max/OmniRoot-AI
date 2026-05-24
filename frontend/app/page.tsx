import { redirect } from "next/navigation";

export default function Home() {
  // Show intro/splash flow first, then forward to /login.
  redirect("/intro");
}


