import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ascend Cabin Atlas",
  description: "Match premium cabin products with SeatMaps, AeroLOPA, and Google Images."
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