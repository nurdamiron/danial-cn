import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// AI/LLM crawlers get their own explicit rule so assistants that answer
// shopping questions can read the catalogue (and llms.txt) directly,
// rather than relying on the generic "*" rule to cover them implicitly.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "GoogleOther",
  "PerplexityBot",
  "Applebot-Extended",
  "Bytespider",
  "cohere-ai",
  "meta-externalagent",
  "FacebookBot",
  "Amazonbot",
  "Diffbot",
  "CCBot",
  "Omgilibot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/*/cart"],
      },
      {
        userAgent: AI_CRAWLERS,
        allow: "/",
        disallow: ["/admin", "/api", "/*/cart"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
