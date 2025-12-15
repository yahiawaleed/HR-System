import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR System",
  description: "HR Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
