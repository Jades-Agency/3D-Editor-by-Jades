import localFont from "next/font/local";

export const overusedGrotesk = localFont({
  variable: "--font-overused-grotesk",
  src: [
    {
      path: "../../public/fonts/overused-grotesk/OverusedGrotesk-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/overused-grotesk/OverusedGrotesk-Book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/overused-grotesk/OverusedGrotesk-Roman.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/overused-grotesk/OverusedGrotesk-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/overused-grotesk/OverusedGrotesk-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/overused-grotesk/OverusedGrotesk-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/overused-grotesk/OverusedGrotesk-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/overused-grotesk/OverusedGrotesk-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  display: "swap",
});
