import { redirect } from "next/navigation";

export default function LegacyGroupsRedirectPage() {
  redirect("/app/groups");
}
