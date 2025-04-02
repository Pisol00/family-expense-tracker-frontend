import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "บัญชีรายรับรายจ่ายครอบครัว",
  description: "บริหารการเงินครอบครัวอย่างชาญฉลาด",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${notoSansThai.variable} antialiased font-noto`}
      >
        {children}
      </body>
    </html>
  );
}