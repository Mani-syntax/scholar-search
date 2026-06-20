import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const taskInstructions: Record<string, string> = {
  summarize: `Explain the supplied research paper abstract for a beginner. Use Markdown headings: Problem Statement, Core Idea, Method, Results, Limitations, Difficulty Level, and Real-world Applications. Do not invent results not in the abstract.`,
  'next-steps': `Based only on the supplied research abstract, provide Markdown headings: Related Topics, Improvement Ideas, Research Gaps, Mini Project Ideas, and Advanced Research Idea. Clearly mark suggestions as suggestions.`,
  implementation: `Turn the supplied research idea into a practical Markdown implementation plan with: Step-by-step Implementation Guide, Tools & Technologies Required, Dataset Requirements, Estimated Time, Expected Output, and Challenges.`,
  'gap-analysis': `Compare the supplied papers or research content. Use Markdown headings: Comparison Overview, Shared Themes, Key Differences, Methodology and Evidence, Limitations, Research Gaps, and Future Directions. Do not claim to have read material that is not supplied.`,
};

const writingInstruction = (type: string) => `Act as a careful academic writing assistant. Task: ${type}.
Return polished Markdown only. Preserve the user's claims; do not fabricate citations, data, or results. When information is missing, use [add detail] rather than making it up.`;

export async function POST(request: NextRequest, { params }: { params: Promise<{ task: string }> }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service is not configured' }, { status: 503 });
  }

  const { task } = await params;
  const body = await request.json().catch(() => null);
  const content = typeof body?.abstract === 'string' ? body.abstract : body?.content;
  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }
  if (content.length > 30_000) {
    return NextResponse.json({ error: 'Please limit input to 30,000 characters' }, { status: 413 });
  }

  const instruction = task === 'writing'
    ? writingInstruction(typeof body?.writingType === 'string' ? body.writingType : 'academic writing')
    : taskInstructions[task];
  if (!instruction) return NextResponse.json({ error: 'Unknown AI task' }, { status: 404 });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: instruction }] },
          contents: [{ role: 'user', parts: [{ text: content.trim() }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1800 },
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini request failed', response.status, data?.error?.message);
      return NextResponse.json({ error: 'AI provider request failed' }, { status: 502 });
    }
    const result = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('').trim();
    if (!result) return NextResponse.json({ error: 'AI provider returned no text' }, { status: 502 });
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Gemini request error', error);
    return NextResponse.json({ error: 'AI provider is temporarily unavailable' }, { status: 502 });
  }
}
