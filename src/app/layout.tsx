import type { Metadata } from "next";
import { Inter, Montserrat_Underline } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserratUnderline = Montserrat_Underline({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Green Lunar VMS",
  description: "Visitors, contractors and dispatch management for institutions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${montserratUnderline.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-grey font-sans text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
