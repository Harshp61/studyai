import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateStudySchedule(subjects: {
  name: string
  goal: string
  hours_per_week: number
}[]) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-latest',
    generationConfig: {
      temperature: 0.7,
    },
  })

  const prompt = `You are an expert study planner. Create a detailed 7-day study schedule for a student with the following subjects and goals:

${subjects.map((s, i) => `${i + 1}. Subject: ${s.name}
   Goal: ${s.goal}
   Hours per week: ${s.hours_per_week}`).join('\n\n')}

Return ONLY a valid JSON array (no markdown, no explanation) with this exact structure:
[
  {
    "day": "Monday",
    "sessions": [
      {
        "subject": "Subject Name",
        "topic": "Specific topic to study",
        "duration_minutes": 60,
        "tip": "A helpful study tip for this session"
      }
    ]
  }
]

Rules:
- Distribute hours proportionally based on hours_per_week
- Break sessions into 45-90 minute chunks
- Include specific topics, not vague descriptions
- Add rest days where appropriate
- Ensure variety throughout the week`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // 🔥 safer JSON extraction (handles extra text if model misbehaves)
  const jsonMatch = text.match(/\[\s*{[\s\S]*}\s*\]/)
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from Gemini:\n' + text)
  }

  return JSON.parse(jsonMatch[0])
}