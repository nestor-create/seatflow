import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ascend Cabin Atlas",
  description: "Seat matcher with SeatMaps, AeroLOPA, and image search."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}