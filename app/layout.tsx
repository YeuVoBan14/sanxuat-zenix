import { Roboto } from "next/font/google";
import "@/globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { Metadata } from "next";

import Head from "next/head";
import { Toaster } from "@/components/ui/toaster";
import Providers from "./Providers";
<Head>
  <link
    rel="icon"
    type="image/png"
    sizes="32x32"
    href="/path-to-your/favicon.png"
  />
</Head>;

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export async function generateMetadata(): Promise<Metadata> {
  const title = "Mega Admin";
  const description = "Phần mềm quản lý  cho doanh nghiệp";

  return {
    title,
    description,
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title,
      description,
      url: "https://mega.zenix.com.vn",
      siteName: title,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={roboto.className}>
        <Providers>
          <ThemeProvider
            themes={["dark", "custom", "light"]}
            attribute="class"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex">{children}</div>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
