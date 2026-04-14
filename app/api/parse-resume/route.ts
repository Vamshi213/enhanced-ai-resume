import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

/**
 * POST /api/parse-resume
 * Uses claude-haiku-4-5 (~350 tokens) to extract a structured UserProfile from raw resume text.
 */
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 500 });
  }

  let body: { resumeText?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { resumeText } = body;
  if (!resumeText?.trim()) {
    return NextResponse.json({ error: 'resumeText is required.' }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Extract a candidate profile from the resume below. Respond with ONLY valid JSON — no markdown, no explanation.

JSON shape:
{
  "name": "full name or Unknown",
  "title": "most recent job title",
  "yearsExperience": <integer, total professional years>,
  "skills": ["Technology1", "Technology2", ...],
  "domains": ["frontend"|"backend"|"fullstack"|"ml"|"devops"|"leadership"|"mobile"],
  "education": "Degree · School · Year (one line, brief)"
}

Resume:
${resumeText.slice(0, 3500)}`,
        },
      ],
    });

    const raw =
      message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const jsonText = raw
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    const profile = JSON.parse(jsonText);
    return NextResponse.json(profile);
  } catch (err) {
    console.error('parse-resume error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Parse failed.' },
      { status: 500 }
    );
  }
}
