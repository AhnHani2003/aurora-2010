import type { Metadata } from "next";
import "./globals.css";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
export const metadata: Metadata = {
  // LanguageProvider owns the bilingual title, including its English SSR default.
  description:
    "An October 20 surprise, made with love by Tom. A secret garden, a little adventure, and you.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <AudioProvider>{children}</AudioProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
