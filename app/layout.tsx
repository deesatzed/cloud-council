import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Cloud Council",
  description: "A visual debate between historical mentors, grounded in your own principles.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
