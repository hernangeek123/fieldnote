import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FieldNote",
    short_name: "FieldNote",
    description: "Speak the job. Send the invoice. Get paid.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6f3",
    theme_color: "#176b3a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
