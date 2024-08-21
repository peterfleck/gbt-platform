import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "../globals.css";

const noto_sans = Noto_Sans({
    subsets: ["latin"],
    display: 'swap',
    variable: "--font-noto-sans"
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

const RTL_LOCALES = ['ar']

export default function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string }
}>) {
  return (
    <html
        className={noto_sans.variable}
        lang={params.locale}
        dir={RTL_LOCALES.includes(params.locale) ? 'rtl' : 'ltr'}
    >
      <body>{children}</body>
    </html>
  );
}
