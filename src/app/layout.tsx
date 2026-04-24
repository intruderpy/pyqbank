import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PYQBank — Previous Year Questions for SSC, Railway & Banking",
    template: "%s | PYQBank",
  },
  description:
    "Free Previous Year Questions (PYQ) for SSC CGL, CHSL, Railway NTPC, Banking IBPS and more. Practice with MCQ quiz mode, filter by exam, year, and subject.",
  keywords: [
    "PYQ",
    "Previous Year Questions",
    "SSC CGL",
    "SSC CHSL",
    "Railway NTPC",
    "Banking IBPS",
    "SBI PO",
    "Mock Test",
    "Hindi Questions",
  ],
  openGraph: {
    title: "PYQBank — Previous Year Questions",
    description: "Practice PYQ for SSC, Railway, Banking exams — free forever.",
    type: "website",
    locale: "en_IN",
    siteName: "PYQBank",
  },
  robots: { index: true, follow: true },
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
