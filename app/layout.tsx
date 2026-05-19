import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plan.Teach_kz",
  description: "Физикаға арналған интеллектуалды адаптивті оқу платформасы",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kk" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
