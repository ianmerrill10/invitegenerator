// ============================================
// AWS BEDROCK SERVICE
// AI generation using Claude
// ============================================

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type { AIGenerationRequest, AIGenerationResponse, EventType } from '@/types';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
  stop_reason: string;
}

/**
 * Invoke Claude model via Bedrock
 */
async function invokeModel(messages: ClaudeMessage[], systemPrompt?: string): Promise<string> {
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    messages,
    ...(systemPrompt && { system: systemPrompt }),
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body)) as ClaudeResponse;

  return responseBody.content[0]?.text || '';
}

/**
 * Generate invitation text content using AI
 */
export async function generateInvitationText(
  request: AIGenerationRequest
): Promise<AIGenerationResponse> {
  const systemPrompt = `You are an expert invitation designer and copywriter. Your task is to create beautiful, engaging invitation text for various events.

You should:
- Write warm, inviting copy that matches the event type and formality level
- Include all essential details (who, what, when, where)
- Match the tone to the specified style (casual, semi-formal, formal)
- Create text that works well visually on an invitation

Always respond with valid JSON in this format:
{
  "headline": "Main headline text",
  "subheadline": "Secondary text line",
  "body": "Main invitation body text",
  "details": "Event details (date, time, location)",
  "rsvp": "RSVP instruction text",
  "closing": "Closing message"
}`;

  const userPrompt = `Create invitation text for the following event:

Event Type: ${request.eventType}
Title: ${request.eventDetails.title || 'Not specified'}
Date: ${request.eventDetails.date || 'Not specified'}
Time: ${request.eventDetails.time || 'Not specified'}
Location: ${request.eventDetails.location || 'Not specified'}
Host: ${request.eventDetails.hostName || 'Not specified'}
Description: ${request.eventDetails.description || 'Not specified'}

Style Preferences:
- Aesthetic: ${request.style.aesthetic}
- Formality: ${request.style.formality}
- Color Scheme: ${request.style.colorScheme}
- Mood: ${request.mood || 'celebratory'}

${request.additionalInstructions ? `Additional Instructions: ${request.additionalInstructions}` : ''}

Generate engaging invitation text that fits this event perfectly.`;

  try {
    const response = await invokeModel(
      [{ role: 'user', content: userPrompt }],
      systemPrompt
    );

    // Parse the JSON response
    const textContent = JSON.parse(response);

    return {
      success: true,
      invitation: {
        title: textContent.headline,
        description: textContent.body,
      },
      suggestions: [
        { type: 'text', content: textContent.headline, confidence: 0.95 },
        { type: 'text', content: textContent.subheadline, confidence: 0.9 },
        { type: 'text', content: textContent.body, confidence: 0.9 },
        { type: 'text', content: textContent.rsvp, confidence: 0.85 },
      ],
      creditsUsed: 1,
    };
  } catch (error) {
    console.error('Error generating invitation text:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI generation failed',
      creditsUsed: 0,
    };
  }
}

/**
 * Generate color palette suggestions using AI
 */
export async function generateColorPalette(
  eventType: EventType,
  mood: string,
  preferences?: string[]
): Promise<{ colors: string[]; name: string }[]> {
  const systemPrompt = `You are an expert color designer specializing in event invitations. Generate beautiful, harmonious color palettes.

Always respond with valid JSON array in this format:
[
  {
    "name": "Palette name",
    "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"]
  }
]

Each palette should have exactly 5 colors: primary, secondary, accent, background, and text color.`;

  const userPrompt = `Generate 3 beautiful color palettes for a ${eventType} invitation.

Mood: ${mood}
${preferences?.length ? `Preferred colors to incorporate: ${preferences.join(', ')}` : ''}

The palettes should be:
1. A safe, classic choice
2. A modern, trendy option
3. A bold, unique alternative`;

  try {
    const response = await invokeModel(
      [{ role: 'user', content: userPrompt }],
      systemPrompt
    );

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating color palette:', error);
    // Return default palettes on error
    return [
      {
        name: 'Classic Elegance',
        colors: ['#2C3E50', '#E74C3C', '#ECF0F1', '#BDC3C7', '#34495E'],
      },
      {
        name: 'Modern Minimal',
        colors: ['#1A1A2E', '#16213E', '#E94560', '#F1F1F1', '#0F0F0F'],
      },
      {
        name: 'Warm Celebration',
        colors: ['#EC4899', '#64748B', '#FFF7F5', '#78716C', '#1C1917'],
      },
    ];
  }
}

/**
 * Generate layout suggestions based on content
 */
export async function generateLayoutSuggestions(
  eventType: EventType,
  contentLength: 'short' | 'medium' | 'long',
  hasImage: boolean
): Promise<string[]> {
  const layoutOptions = {
    short: ['minimal', 'modern', 'bold'],
    medium: ['classic', 'elegant', 'playful'],
    long: ['classic', 'rustic', 'custom'],
  };

  // Return appropriate layouts based on content
  const suggestions = layoutOptions[contentLength];

  // Adjust based on event type
  if (eventType === 'wedding') {
    return ['elegant', 'classic', 'romantic'];
  } else if (eventType === 'birthday') {
    return ['playful', 'bold', 'modern'];
  } else if (eventType === 'corporate') {
    return ['minimal', 'modern', 'classic'];
  }

  return suggestions;
}

/**
 * Improve/rewrite text content
 */
export async function improveText(
  originalText: string,
  instruction: string
): Promise<string> {
  const systemPrompt = `You are an expert copywriter. Improve the given text based on the instruction provided. Return only the improved text, no explanations.`;

  const userPrompt = `Original text: "${originalText}"

Instruction: ${instruction}

Provide the improved text:`;

  try {
    const response = await invokeModel(
      [{ role: 'user', content: userPrompt }],
      systemPrompt
    );

    return response.trim();
  } catch (error) {
    console.error('Error improving text:', error);
    return originalText;
  }
}
