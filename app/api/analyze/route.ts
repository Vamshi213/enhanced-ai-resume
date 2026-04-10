import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobs';

const client = new Anthropic();

// Cached system prompt — these resume guidelines are reused across every analysis request.
const SYSTEM_PROMPT = `You are an expert resume coach, ATS specialist, and technical recruiter with 15 years of experience. You evaluate resumes against job descriptions with the same precision a senior hiring manager would use during a real screening process.

## Resume evaluation criteria

### Skills match (0-100)
Score how well the candidate's demonstrated technical skills align with the job's required and preferred technologies. Penalise heavily for missing must-have skills. Reward exact terminology matches from the JD.

### Experience relevance (0-100)
Score how closely the candidate's work history maps to the role's domain, scope, and level. A backend engineer applying for a frontend role scores lower here. Recent experience counts more than older experience.

### Impact quantification (0-100)
Score how well the resume uses the framework "Accomplished [result] as measured by [number] by doing [contribution]". Every bullet with a specific metric adds points. Vague bullets ("helped improve performance") subtract points. No number = significant penalty.

### Formatting (0-100)
Score adherence to recruiter best practices: active verbs, no "we" language, no clichés, consistent date formats (Month YYYY – Month YYYY), no self-rated skill bars, proper section order for career level, no personal data beyond name/email/links.

### ATS keyword optimization (0-100)
Score how many of the exact keywords from the JD (especially in the requirements section) appear in the resume. Case-insensitive match. Penalise if key role-defining terms are absent.

## Output format
Respond ONLY with a single valid JSON object. No markdown, no explanation, no code fences — just raw JSON.

Required JSON shape:
{
  "score": <integer 0-100, weighted average of all breakdown scores>,
  "breakdown": {
    "skillsMatch": <integer 0-100>,
    "experienceRelevance": <integer 0-100>,
    "impactQuantification": <integer 0-100>,
    "formatting": <integer 0-100>,
    "keywordOptimization": <integer 0-100>
  },
  "recruiterLikelihood": <"Very High" | "High" | "Medium" | "Low">,
  "strengths": [<3-5 specific strength strings based on actual resume content>],
  "missingSkills": [<list of technologies/skills explicitly required in JD but absent from resume>],
  "suggestions": [<5-8 specific, actionable improvement instructions — reference actual bullets from resume>],
  "formattedResume": <complete resume rewritten as plain text following all rules below>
}

## Rules for formattedResume field
- Rewrite the resume using ONLY information present in the candidate's original resume — never invent numbers, titles, or technologies
- If a bullet lacks a number, add a placeholder like "[X%]" and note it needs filling in
- Use active verbs: led, built, shipped, reduced, drove, improved, designed, launched, migrated
- Remove all "we" language — rewrite as first-person singular (implied I)
- Remove clichés: "team player", "fast learner", "passionate", "results-driven"
- Standardise dates to "Month YYYY – Month YYYY" format; drop month for dates more than 4 years ago
- Section order for mid-level: Work Experience, Languages & Technologies, Education
- Languages & Technologies: comma-separated, technologies from JD listed first
- No self-rated skill bars, stars, or percentages
- No "References available on request"
- Include name, email, and professional links (GitHub, LinkedIn) at top — no full mailing address
- Escape all special characters properly for valid JSON string (use \\n for newlines)`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Add it to your .env.local file.' },
      { status: 500 }
    );
  }

  let body: { resumeText?: string; jobId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { resumeText, jobId } = body;

  if (!resumeText?.trim()) {
    return NextResponse.json({ error: 'resumeText is required.' }, { status: 400 });
  }
  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required.' }, { status: 400 });
  }

  const job = getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
  }

  const jdContext = `JOB DESCRIPTION TO MATCH AGAINST
=================================
Title: ${job.title}
Company: ${job.company}
Location: ${job.location} (${job.type})
Salary: ${job.salary}

About the role:
${job.description}

Required qualifications:
${job.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Nice to have:
${job.niceToHave.map((r) => `- ${r}`).join('\n')}

Required technologies (weight these heavily in skillsMatch and keywordOptimization):
${job.techStack.join(', ')}`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          // Cache the system prompt — it's identical for every analysis request
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              // Cache the JD context — same for all candidates applying to the same job
              text: jdContext,
              cache_control: { type: 'ephemeral' },
            },
            {
              type: 'text',
              text: `CANDIDATE RESUME TO ANALYZE
============================
${resumeText}

Analyze this resume against the job description above. Return only the JSON object described in your instructions.`,
            },
          ],
        },
      ],
    });

    const rawText =
      message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    // Strip accidental markdown code fences if the model added them
    const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    let result;
    try {
      result = JSON.parse(jsonText);
    } catch {
      console.error('JSON parse failed. Raw response:', rawText.slice(0, 500));
      return NextResponse.json(
        { error: 'The AI returned an unexpected format. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Anthropic API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `AI analysis failed: ${message}` }, { status: 500 });
  }
}
