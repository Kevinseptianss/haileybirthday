import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hailey's 1st Birthday Celebration 🎂",
  description: "Join us in celebrating Hailey's magical first birthday party on 8 Agustus 2025 at Aroem Restaurant & Ballroom",
  openGraph: {
    title: "Hailey's 1st Birthday Celebration",
    description: "Join us for a magical celebration as Hailey turns ONE!",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
