"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const templates = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with a clean slate",
    category: "General",
  },
  {
    id: "business",
    name: "Business",
    description: "Professional layout for businesses and services",
    category: "Business",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Showcase your work and projects",
    category: "Creative",
  },
  {
    id: "blog",
    name: "Blog",
    description: "Content-focused layout for writers and publishers",
    category: "Content",
  },
  {
    id: "landing",
    name: "Landing Page",
    description: "High-converting single page for products or campaigns",
    category: "Marketing",
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Online store with product listings and cart",
    category: "Commerce",
  },
];

export default function NewWebsitePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Website name is required");
      return;
    }
    if (!selectedTemplate) {
      setError("Please select a template");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://localhost:4000/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          template: selectedTemplate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create website");
      }

      const data = await response.json();
      router.push(`/websites`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create website");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Create New Website
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Step {step} of 2
          </p>
        </div>
        <Link
          href="/websites"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Cancel
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
        <div
          className="bg-zinc-900 dark:bg-zinc-100 h-2 rounded-full transition-all"
          style={{ width: `${(step / 2) * 100}%` }}
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Name */}
      {step === 1 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            What&apos;s your website called?
          </h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., My Awesome Business"
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-lg"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) setStep(2);
            }}
          />
          <div className="flex justify-end mt-6">
            <button
              onClick={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
              className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Template */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Choose a template
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Start with a pre-built layout or go with a blank canvas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTemplate === template.id
                      ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-3 flex items-center justify-center">
                    <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                    {template.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {template.description}
                  </p>
                  <span className="inline-block mt-2 text-xs text-zinc-500 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                    {template.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Website name</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Template</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                  {templates.find((t) => t.id === selectedTemplate)?.name || "Not selected"}
                </span>
              </div>
            </div>
            <div className="flex justify-between gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating || !selectedTemplate}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Website"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
