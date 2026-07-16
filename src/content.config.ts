import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const eventLink = z
  .string()
  .refine((value) => value.startsWith("/") || URL.canParse(value), {
    message: "Event links must be site-relative or absolute URLs",
  });

const events = defineCollection({
  type: "content_layer",
  loader: glob({ pattern: "**/*.md", base: "./src/content/events" }),
  schema: z.object({
    title: z.string(),
    category: z.enum(["Festival", "Side Event", "Performance", "Get Involved"]),
    status: z.enum(["upcoming", "past"]),
    dateLabel: z.string(),
    location: z.string(),
    description: z.string(),
    primaryLink: z.object({ label: z.string(), url: eventLink }).optional(),
    secondaryLink: z.object({ label: z.string(), url: eventLink }).optional(),
    image: z.string().optional(),
  }),
});

export const collections = { events };
