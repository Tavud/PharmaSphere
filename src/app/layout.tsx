import type { Metadata } from "next";
import "./globals.css";
import { AppStateProvider } from "@/features/preferences/app-state-context";

export const metadata: Metadata = {
  title: "PharmaSphere — Интеллектуальная среда клинической фармакологии",
  description:
    "Современная научно-образовательная платформа и справочник по клинической фармакологии для студентов медицинских вузов.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-navy-950 dark:text-slate-100">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
