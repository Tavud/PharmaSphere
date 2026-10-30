import { redirect } from "next/navigation";

export default function LegacyLearningRedirectPage() {
  redirect("/app/learning");
}
