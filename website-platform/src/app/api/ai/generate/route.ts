import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = 'gemma4:31b';
const REQUEST_TIMEOUT = 60000;

const SECTION_SCHEMAS: Record<string, string> = {
  hero: `{
  "heading": "string - main headline",
  "subheading": "string - supporting text",
  "description": "string - detailed description",
  "ctaText": "string - call to action button text"
}`,
  features: `{
  "heading": "string - section title",
  "item1Title": "string",
  "item1Desc": "string",
  "item2Title": "string",
  "item2Desc": "string",
  "item3Title": "string",
  "item3Desc": "string"
}`,
  testimonials: `{
  "heading": "string - section title",
  "testimonial1Text": "string",
  "testimonial1Author": "string",
  "testimonial2Text": "string",
  "testimonial2Author": "string"
}`,
  pricing: `{
  "heading": "string - section title",
  "plan1Name": "string",
  "plan1Price": "string",
  "plan1Features": ["string"],
  "plan2Name": "string",
  "plan2Price": "string",
  "plan2Features": ["string"]
}`,
  cta: `{
  "heading": "string",
  "description": "string",
  "buttonText": "string"
}`,
  faq: `{
  "heading": "string",
  "qaPairs": [{"question": "string", "answer": "string"}]
}`,
};

const SYSTEM_PROMPT = `You are a professional website content generator. Your task is to generate structured JSON content for website sections based on the user's prompt.

Available section types and their JSON schemas:

Hero Section:
${SECTION_SCHEMAS.hero}

Features Section:
${SECTION_SCHEMAS.features}

Testimonials Section:
${SECTION_SCHEMAS.testimonials}

Pricing Section:
${SECTION_SCHEMAS.pricing}

CTA Section:
${SECTION_SCHEMAS.cta}

FAQ Section:
${SECTION_SCHEMAS.faq}

Rules:
1. Return ONLY valid JSON. No markdown code blocks, no explanations, no backticks.
2. The JSON must match the schema for the requested section type exactly.
3. Generate compelling, professional, and conversion-optimized copy.
4. Keep content concise and impactful.
5. Do not include any text before or after the JSON object.
6. Start your response with { and end with }.
7. Use proper escaping for any special characters in strings.`;

function validateRequestBody(body: unknown): { prompt: string; sectionType: string; model?: string } {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be a valid JSON object');
  }

  const { prompt, sectionType, model } = body as Record<string, unknown>;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('prompt is required and must be a non-empty string');
  }

  if (!sectionType || typeof sectionType !== 'string') {
    throw new Error('sectionType is required and must be a string');
  }

  if (!SECTION_SCHEMAS[sectionType]) {
    throw new Error(
      `Invalid sectionType: "${sectionType}". Valid types are: ${Object.keys(SECTION_SCHEMAS).join(', ')}`
    );
  }

  if (model !== undefined && typeof model !== 'string') {
    throw new Error('model must be a string if provided');
  }

  return {
    prompt: prompt.trim(),
    sectionType: sectionType.trim(),
    model,
  };
}

function buildUserPrompt(prompt: string, sectionType: string): string {
  return `Generate content for a "${sectionType}" section of a website.

Context/Prompt: ${prompt}

Return ONLY the JSON object matching the ${sectionType} schema.`;
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    let validated: { prompt: string; sectionType: string; model?: string };
    try {
      validated = validateRequestBody(body);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Invalid request body' },
        { status: 400 }
      );
    }

    const { prompt, sectionType, model } = validated;
    const modelName = model || DEFAULT_MODEL;

    const ollamaBody = {
      model: modelName,
      prompt: buildUserPrompt(prompt, sectionType),
      system: SYSTEM_PROMPT,
      stream: true,
      options: {
        temperature: 0.7,
        num_predict: 2048,
      },
    };

    let controller: AbortController | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      controller = new AbortController();
      timeoutId = setTimeout(() => controller?.abort(), REQUEST_TIMEOUT);

      const ollamaResponse = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ollamaBody),
        signal: controller.signal,
      });

      if (!ollamaResponse.ok) {
        let errorDetail = `Ollama API returned status ${ollamaResponse.status}`;
        try {
          const errorBody = await ollamaResponse.text();
          if (errorBody) {
            errorDetail += `: ${errorBody}`;
          }
        } catch {
          // ignore
        }
        throw new Error(errorDetail);
      }

      if (!ollamaResponse.body) {
        throw new Error('Ollama API returned an empty response body');
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let fullContent = '';

      const readableStream = new ReadableStream({
        async start(streamController) {
          const reader = ollamaResponse.body!.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n').filter((line) => line.trim());

              for (const line of lines) {
                try {
                  const parsed = JSON.parse(line);
                  if (parsed.response) {
                    fullContent += parsed.response;
                    streamController.enqueue(
                      encoder.encode(
                        JSON.stringify({ content: parsed.response }) + '\n'
                      )
                    );
                  }
                  if (parsed.done) {
                    streamController.enqueue(
                      encoder.encode(
                        JSON.stringify({
                          done: true,
                          content: fullContent,
                        }) + '\n'
                      )
                    );
                  }
                } catch {
                  // skip malformed JSON lines
                }
              }
            }
          } finally {
            reader.releaseLock();
            streamController.close();
          }
        },
        cancel() {
          controller?.abort();
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Ollama took too long to respond.' },
          { status: 504 }
        );
      }

      if (err instanceof Error && err.message?.includes('fetch')) {
        return NextResponse.json(
          {
            error: 'Ollama service is unavailable. Make sure Ollama is running at http://localhost:11434',
            details: err.message,
          },
          { status: 503 }
        );
      }

      throw err;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  } catch (err) {
    console.error('AI generation route error:', err);
    return NextResponse.json(
      {
        error: 'Internal server error during content generation',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
