import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/modules/home/ui/components/theme/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "VibeTube - Share Your Vibe, Watch the World",
    template: "%s | VibeTube",
  },
  description:
    "VibeTube is your ultimate video-sharing platform. Upload, watch, and share videos with AI-powered features, real-time transcription, and a seamless viewing experience.",
  keywords: [
    "video sharing",
    "video platform",
    "watch videos",
    "upload videos",
    "streaming",
    "content creation",
    "VibeTube",
    "video player",
    "playlists",
    "live streaming",
  ],
  authors: [{ name: "VibeTube Team" }],
  creator: "Ali Fouanne",
  publisher: "VibeTube",
  applicationName: "VibeTube",
  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "",
    siteName: "VibeTube",
    title: "VibeTube - Share Your Vibe, Watch the World",
    description:
      "Discover, watch, and share amazing videos on VibeTube. Join millions of creators and viewers in the ultimate video-sharing experience.",
    images: [
      {
        url: "../../public/logo.svg",
        width: 1200,
        height: 630,
        alt: "VibeTube - Video Sharing Platform",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${poppins.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCProvider>
              <Toaster />
              {children}
            </TRPCProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
