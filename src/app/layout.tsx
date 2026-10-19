import type { Metadata } from "next";
import "./globals.css";
import { AudioProvider } from "@/components/audio/AudioProvider";
export const metadata: Metadata = {
  title: "A little love, a lot of luck · For Aurora",
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
    <html lang="en">
      <body>
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}
