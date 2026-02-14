"use client";

import { useEffect, useState } from "react";
import { gateway } from "ai";

type GatewayModel = {
  id: string;
  displayName?: string;
  description?: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [models, setModels] = useState<GatewayModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");

  useEffect(() => {
    const loadModels = async () => {
      try {
        const available = await gateway.getAvailableModels();
        console.log("Available models from gateway:", available);
        setModels(available);
        if (available.length > 0) {
          setSelectedModel(available[0].id);
        }
      } catch (e) {
        console.error("Failed to load models from gateway", e);
      }
    };
    loadModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("Extraction failed");

      const data = await res.json();
      console.log("Received extraction data:", data);
      setResult(data.extraction);
    } catch (err: any) {
      console.error("Error during extraction:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      {/* generalized title */}
      <h1 className="text-3xl font-bold mb-6 text-center">
        Certificate & Course Extractor
      </h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste any certificate, course, or program URL"
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={models.length === 0}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName ?? m.id}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading || !selectedModel}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Extracting details..." : "Extract Learning Details"}
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {result && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Extracted Information</h2>
          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-[70vh]">
            {result}
          </pre>
        </div>
      )}
    </main>
  );
}
