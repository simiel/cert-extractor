"use client";

import { useCompletion } from "@ai-sdk/react";

export default function Home() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion({
      api: "/api/extract",
      onError: (err) => {
        console.error("Completion error:", err);
      },
    });

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Coursera Certificate Extractor with Grok (Streaming)
      </h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <input
          type="url"
          value={input}
          onChange={handleInputChange}
          placeholder="https://coursera.org/verify/specialization/EVYQWM316UA9"
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {isLoading
            ? "Extracting with Grok..."
            : "Extract Certificate Details"}
        </button>
      </form>

      {(completion || isLoading) && (
        <div className="bg-gray-50 p-6 rounded-lg border min-h-[200px]">
          <h2 className="text-xl font-semibold mb-4">Extracted Information</h2>

          {/* This is the streaming part — completion updates live */}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {completion ||
              (isLoading && (
                <span className="text-gray-500">Streaming response...</span>
              ))}
          </div>

          {/* Optional: nice loading indicator while waiting for first chunk */}
          {isLoading && !completion && (
            <div className="mt-4 flex items-center text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Grok is analyzing the certificate...
            </div>
          )}
        </div>
      )}
    </main>
  );
}
