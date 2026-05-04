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

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function generateStudySchedule(
  subjects: Subject[]
): Promise<DayPlan[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
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
- Keep realistic workload
- Include at least 1 lighter day
- Avoid repetition
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    console.log("🔍 RAW GEMINI RESPONSE:\n", text)

    // ✅ Clean markdown if Gemini adds it
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let parsed: DayPlan[]

    try {
      parsed = JSON.parse(cleaned)
    } catch (err) {
      console.error("❌ JSON PARSE FAILED")
      throw new Error("Invalid JSON from Gemini")
    }

    // ✅ Validate structure
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid format: Expected array')
    }

    for (const day of parsed) {
      if (!day.day || !Array.isArray(day.sessions)) {
        throw new Error('Invalid day format from AI')
      }

      for (const session of day.sessions) {
        if (!session.subject || !session.duration_minutes) {
          throw new Error('Invalid session format')
        }
      }
    }

    return parsed
  } catch (error: any) {
    console.error('🔥 Gemini Error:', error)
    throw new Error(error.message || 'Failed to generate study schedule')
  }
}