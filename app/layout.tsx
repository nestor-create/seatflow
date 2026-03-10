import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ascend Cabin Atlas",
  description: "Paste a Google Flights screenshot to detect premium cabin products."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}