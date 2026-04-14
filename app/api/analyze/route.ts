import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getJob } from '@/lib/jobs';

const client = new Anthropic();

/**
 * Cached system prompt — identical across every analysis request, so it is
 * eligible for Anthropic prompt caching after the first call.
 */
const SYSTEM_PROMPT = `You are an expert resume coach and ATS system. Evaluate the resume against the job description and output results in this EXACT line-based format — nothing else, no markdown, no extra text:

SCORE: [weighted overall 0-100]
SKILLS: [skills match 0-100]
EXPERIENCE: [experience relevance 0-100]
IMPACT: [impact quantification 0-100 — penalise bullets without numbers]
FORMAT: [formatting quality 0-100 — active verbs, no we-language, clean dates]
KEYWORDS: [ATS keyword coverage 0-100 — exact JD term matches]
LIKELIHOOD: [Very High|High|Medium|Low]
STRENGTH: [one specific strength from actual resume, repeat this line 3-5 times]
MISSING: [comma-separated required skills absent from resume, or NONE]
FIX: [one specific actionable improvement referencing actual resume content, repeat 5-7 times]
RESUME
[Complete resume rewritten as plain text. Rules: only use information in the original resume — never invent facts; add [X] placeholders where metrics are missing; use active verbs; remove we-language and clichés; standardise dates to Month YYYY format; sections: Work Experience / Languages & Technologies / Education.]`;

/**
 * POST /api/analyze  — streams the analysis line by line using SSE.
 * Uses claude-sonnet-4-6 with prompt caching for the system prompt and JD context.
 */
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { resumeText?: string; jobId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON.', { status: 400 });
  }

  const { resumeText, jobId } = body;
  if (!resumeText?.trim()) return new Response('resumeText required.', { status: 400 });
  if (!jobId) return new Response('jobId required.', { status: 400 });

  const job = getJob(jobId);
  if (!job) return new Response('Job not found.', { status: 404 });

  const jdContext = `JOB TO MATCH AGAINST
Title: ${job.title} at ${job.company} (${job.type}, ${job.location})
Salary: ${job.salary}
Required technologies: ${job.techStack.join(', ')}
Requirements:
${job.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}
Nice to have: ${job.niceToHave.join('; ')}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const apiStream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: jdContext,
                  cache_control: { type: 'ephemeral' },
                },
                {
                  type: 'text',
                  text: `CANDIDATE RESUME:\n${resumeText}`,
                },
              ],
            },
          ],
        });

        for await (const event of apiStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = `\nERROR: ${err instanceof Error ? err.message : 'Unknown error'}`;
        controller.enqueue(encoder.encode(msg));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
