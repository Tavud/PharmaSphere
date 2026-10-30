import { redirect } from "next/navigation";

export default async function LegacyDrugDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/app/drugs/${id}`);
}
