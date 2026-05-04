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