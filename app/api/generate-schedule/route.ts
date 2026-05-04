import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateStudySchedule } from '@/lib/gemini'

function getDateForDay(dayName: string): string {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const now = new Date()
  const dayIndex = DAYS.indexOf(dayName)
  const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1
  const diff = dayIndex - currentDay
  const target = new Date(now)
  target.setDate(now.getDate() + diff)
  return target.toISOString().split('T')[0]
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id)

    if (subjectsError || !subjects || subjects.length === 0) {
      return NextResponse.json({ error: 'Please add at least one subject first' }, { status: 400 })
    }

    // Generate schedule with Gemini
    const schedule = await generateStudySchedule(subjects.map(s => ({
      name: s.name,
      goal: s.goal,
      hours_per_week: s.hours_per_week,
    })))

    // Clear existing sessions for this user
    await supabase.from('study_sessions').delete().eq('user_id', user.id)

    // Insert new sessions
    const sessions: any[] = []
    for (const day of schedule) {
      for (const session of day.sessions) {
        const subject = subjects.find(s => s.name.toLowerCase() === session.subject.toLowerCase())
          || subjects[0] // fallback

        sessions.push({
          user_id: user.id,
          subject_id: subject.id,
          scheduled_date: getDateForDay(day.day),
          duration_minutes: session.duration_minutes,
          topic: session.topic,
          completed: false,
        })
      }
    }

    const { error: insertError } = await supabase.from('study_sessions').insert(sessions)
    if (insertError) throw new Error(insertError.message)

    return NextResponse.json({ success: true, sessions_created: sessions.length })
  } catch (error: any) {
    console.error('Generate schedule error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate schedule' }, { status: 500 })
  }
}
