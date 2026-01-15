import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "High-end Figure Collector Shop",
    description: "Exclusive collectibles for serious fans",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className={inter.className}>
                {children}
                <Script src="https://cdn.iamport.kr/v1/iamport.js" strategy="afterInteractive" />
            </body>
        </html>
    );
}
