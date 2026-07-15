import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Atlas Flag Globe",
  description:
    "A reusable 3D globe that masks one country out of a metallic Earth and fills it with its national flag.",
};

export const viewport: Viewport = {
  themeColor: "#0b2038",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
