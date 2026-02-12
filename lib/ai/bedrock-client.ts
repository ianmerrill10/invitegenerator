/**
 * AWS Bedrock Client Utility
 *
 * Centralised interface for invoking AWS Bedrock models (Claude 3 family).
 * Uses lazy initialisation to prevent build-time errors when env vars are not
 * yet available.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BedrockOptions {
  modelId?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

// ---------------------------------------------------------------------------
// Lazy-initialised client
// ---------------------------------------------------------------------------

let _bedrockClient: BedrockRuntimeClient | null = null;

function getBedrockClient(): BedrockRuntimeClient {
  if (!_bedrockClient) {
    _bedrockClient = new BedrockRuntimeClient({
      region: process.env.BEDROCK_REGION || process.env.AWS_REGION || "us-east-1",
    });
  }
  return _bedrockClient;
}

// ---------------------------------------------------------------------------
// Core invocation helper
// ---------------------------------------------------------------------------

/**
 * Invoke a Bedrock model and return the raw text output.
 * Defaults to Claude 3 Sonnet when no modelId is specified.
 */
export async function invokeModel(
  prompt: string,
  options: BedrockOptions = {}
): Promise<string> {
  const client = getBedrockClient();
  const modelId =
    options.modelId ||
    process.env.BEDROCK_MODEL_ID ||
    "anthropic.claude-3-sonnet-20240229-v1:0";

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: options.maxTokens || 2048,
    temperature: options.temperature ?? 0.7,
    top_p: options.topP ?? 0.9,
    messages: [
      {
        role: "user" as const,
        content: prompt,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  if (responseBody.content && responseBody.content.length > 0) {
    return responseBody.content[0].text;
  }

  throw new Error("Empty response from Bedrock");
}

// ---------------------------------------------------------------------------
// JSON invocation helper
// ---------------------------------------------------------------------------

/**
 * Specialised helper that requests JSON output from Claude and parses it.
 * Strips markdown code fences if Claude includes them.
 */
export async function invokeModelJson<T>(
  prompt: string,
  options: BedrockOptions = {}
): Promise<T> {
  const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include any preamble, explanation, or markdown formatting.`;

  const response = await invokeModel(jsonPrompt, options);

  // Strip markdown code fences that Claude sometimes adds
  const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleanResponse) as T;
}
