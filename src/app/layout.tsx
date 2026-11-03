import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Sprintly — make progress together",
  description: "A lightweight sprint workspace for student engineering teams.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
