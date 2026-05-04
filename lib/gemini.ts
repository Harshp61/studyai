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

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenerativeAI(apiKey)
}

export async function generateStudySchedule(
  subjects: Subject[]
): Promise<DayPlan[]> {
  const genAI = getGenAI()
  
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const prompt = `
        You are an expert study planner. Generate a personalized weekly study schedule based on these subjects:
        ${JSON.stringify(subjects, null, 2)}

        Requirements:
        1. Distribute the "hours_per_week" for each subject across 7 days (Monday to Sunday).
        2. Each session must have: "subject", "topic" (specific to the goal), "duration_minutes", and a "tip".
        3. The output MUST be a valid JSON array of DayPlan objects.
        4. Return ONLY the JSON.

        Example Structure:
        [
          {
            "day": "Monday",
            "sessions": [
              { "subject": "Math", "topic": "Calculus", "duration_minutes": 60, "tip": "Practice problems" }
            ]
          }
        ]
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().replace(/```json|```/g, '').trim()
      const schedule = JSON.parse(text)
      
      if (Array.isArray(schedule) && schedule.length > 0) {
        return schedule
      }
      throw new Error('AI generated an invalid schedule format')
    } catch (error) {
      console.error('Gemini error, using fallback:', error)
    }
  }

  // Fallback Logic
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Calculate total hours per week
  const totalHours = subjects.reduce((sum, subject) => sum + subject.hours_per_week, 0);
  const hoursPerDay = totalHours / 7;

  const schedule: DayPlan[] = DAYS.map(day => ({
    day,
    sessions: [],
  }));

  // Distribute hours across days and subjects
  for (const subject of subjects) {
    let remainingHours = subject.hours_per_week;

    for (const dayPlan of schedule) {
      if (remainingHours <= 0) break;

      const sessionDuration = Math.min(remainingHours, hoursPerDay / subjects.length);
      dayPlan.sessions.push({
        subject: subject.name,
        topic: `Study ${subject.name}`,
        duration_minutes: Math.round(sessionDuration * 60),
        tip: `Focus on your goal: ${subject.goal}`,
      });

      remainingHours -= sessionDuration;
    }
  }

  // Ensure one lighter day
  const lighterDay = schedule[Math.floor(Math.random() * schedule.length)];
  lighterDay.sessions = lighterDay.sessions.slice(0, Math.max(1, lighterDay.sessions.length - 1));

  return schedule;
}