import { xai } from "@ai-sdk/xai";
import { generateText, tool, streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60; // Allow longer responses

// Tool that lets the model fetch and inspect web pages
const fetchPage = tool({
  description: "Fetch the raw HTML content of a web page by URL.",
  inputSchema: z.object({
    url: z.string().url(),
  }),
  async execute({ url }: { url: string }) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
    }
    const html = await res.text();
    // limit the HTML size to avoid overwhelming the model
    const maxSize = 100000; // 100 KB
    if (html.length > maxSize) {
      return { url, html: html.slice(0, maxSize) + "\n\n[HTML truncated]" };
    }
    return { url, html };
  },
});

export async function POST(req: NextRequest) {
  try {
    const { prompt: url }: { prompt: string } = await req.json();

    console.log("Received URL for extraction:", url);

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Construct the same detailed prompt you used originally
    const prompt = `
Take this URL: ${url.startsWith("http") ? url : "https://" + url}

You have access to a tool called "fetchPage" that can download the HTML content of any URL.
Always use this tool to inspect the actual page content instead of guessing.

Start from this URL: ${url.startsWith("http") ? url : "https://" + url}

1. Call fetchPage on the certificate URL.
2. From that HTML, identify any linked main course/specialization/program pages.
3. Call fetchPage on those as needed.
4. From the fetched HTML only (no hallucinations), extract:

- Certificate metadata (holder, issue date, title, issuer, duration, level, rating, etc.)
- In-depth description of what the credential is about and what skills/achievements the holder has
- Full list of skills gained
- Detailed breakdown of each course (title, hours, completion info if available, description, sub-skills)
- Expected capabilities of someone who completed it
- Anything useful for building resumes, CVs, LinkedIn profiles, cover letters

At the end, briefly list which URLs you fetched and what you used each for.
Be extremely thorough and detailed. Use available tools if needed to fetch and analyze pages. Do not hallucinate — base everything on actual page content. Explain your process and sources at the end.
`;

    // Use Grok via AI SDK (choose a strong model)
    const result = streamText({
      model: "xai/grok-4", // or 'grok-4.1-fast-reasoning', 'grok-3', etc.
      prompt,
      temperature: 0.2, // lower for factual accuracy
      tools: {
        addResource: fetchPage,
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to extract data: " + (error.message || "Unknown error"),
      },
      { status: 500 },
    );
  }
}
