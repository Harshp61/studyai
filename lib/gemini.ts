import { GoogleGenerativeAI } from '@google/generative-ai'

type Subject = {
  name: string
  goal: string
  hours_per_week: number
}

type Session = {
  subject: string
  topic: string
  duration_minutes: number
  tip: string
}

type DayPlan = {
  day: string
  sessions: Session[]
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateStudySchedule(
  subjects: Subject[]
): Promise<DayPlan[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json', // 🔥 ensures valid JSON
      },
    })

    const prompt = `
Create a detailed 7-day study schedule.

Subjects:
${subjects
  .map(
    (s, i) =>
      `${i + 1}. ${s.name} (${s.hours_per_week} hrs/week) - Goal: ${s.goal}`
  )
  .join('\n')}

Return JSON in this exact format:
[
  {
    "day": "Monday",
    "sessions": [
      {
        "subject": "string",
        "topic": "string",
        "duration_minutes": number,
        "tip": "string"
      }
    ]
  }
]

Rules:
- Distribute hours proportionally
- Sessions must be 45–90 minutes
- Keep realistic workload for a college student
- Include at least 1 lighter/rest day
- Avoid repeating same subject too many times in a row
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const parsed: DayPlan[] = JSON.parse(text)

    // basic validation (optional but useful)
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid format: Expected array')
    }

    return parsed
  } catch (error: any) {
    console.error('Gemini Error:', error.message)
    throw new Error('Failed to generate study schedule')
  }
}