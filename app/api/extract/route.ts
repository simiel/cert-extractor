import { xai } from "@ai-sdk/xai";
import { generateText, stepCountIs } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { renderPageTool } from "@/tools/renderPage";

export const maxDuration = 60; // Allow longer responses

// Tool that lets the model fetch and inspect web pages
export async function POST(req: NextRequest) {
  try {
    const { url }: { url: string } = await req.json();

    console.log("Received URL for extraction:", url);

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const normalizedUrl = url.startsWith("http") ? url : "https://" + url;

    const prompt = `
Take this URL: ${normalizedUrl}

You have access to a tool called "renderPage" that can download the visible text content of any URL.
Always use this tool to inspect the actual page content instead of guessing.

Start from this URL: ${normalizedUrl}

1. Call renderPage on the certificate URL.
2. From that text, identify any linked main course/specialization/program pages.
3. Call renderPage on those as needed.
4. From the fetched page text only (no hallucinations), extract:

- Certificate metadata (holder, issue date, title, issuer, duration, level, rating, etc.)
- In-depth description of what the credential is about and what skills/achievements the holder has
- Full list of skills gained
- Detailed breakdown of each course (title, hours, completion info if available, description, sub-skills)
- Expected capabilities of someone who completed it
- Anything useful for building resumes, CVs, LinkedIn profiles, cover letters

At the end, briefly list which URLs you fetched and what you used each for.
Be extremely thorough and detailed. Do not hallucinate — base everything on actual page content.
`;

    const result = await generateText({
      model: "openai/gpt-5",
      prompt,
      tools: {
        renderPage: renderPageTool, // tool name matches what the prompt says
      },
      toolChoice: "auto",
      stopWhen: stepCountIs(5),
    });

    console.log(
      "Full generateText result:",
      JSON.stringify(
        {
          text: result.text,
          toolCalls: result.toolCalls,
          finishReason: result.finishReason,
        },
        null,
        2,
      ),
    );

    // This is what your frontend reads as `data.extraction`
    return NextResponse.json({ extraction: result.text });
  } catch (error: any) {
    console.error("Error in /api/extract:", error);
    return NextResponse.json(
      {
        error: "Failed to extract data: " + (error.message || "Unknown error"),
      },
      { status: 500 },
    );
  }
}
