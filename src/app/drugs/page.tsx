import { redirect } from "next/navigation";

export default function LegacyDrugsRedirectPage() {
  redirect("/app/drugs");
}
