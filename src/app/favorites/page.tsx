import { redirect } from "next/navigation";

export default function LegacyFavoritesRedirectPage() {
  redirect("/app/favorites");
}
