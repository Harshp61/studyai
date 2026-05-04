# 📚 StudyAI — AI-Powered Study Planner

An intelligent study planning application that leverages AI to generate personalized, optimized study schedules. Users can define subjects, set study goals, and receive AI-powered study session recommendations based on their availability and preferences.

**Live Demo:** [Deploy on Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourname%2Fstudyai)

---

## 🎯 Features

- **User Authentication** - Secure signup/login with Supabase Auth
- **Subject Management** - Create and organize study subjects with goals and weekly hours
- **AI-Powered Schedule Generation** - Google Gemini generates optimal study plans
- **Study Sessions Tracking** - Plan and track study sessions by date and duration
- **Protected Routes** - Middleware-based authentication for dashboard access
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- **Real-time Sync** - Database synced with Supabase PostgreSQL

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React meta-framework with App Router for server-side rendering, API routes, and optimized performance
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React 18** - Modern UI library with hooks and concurrent rendering

### Backend & Infrastructure
- **Supabase** - Open-source Firebase alternative providing:
  - **PostgreSQL Database** - Relational database for user data, subjects, and study sessions
  - **Authentication** - Built-in user auth with email/password
  - **Row-Level Security (RLS)** - Database-level access control ensuring users only see their data
  - **Real-time Subscriptions** - Live data updates (extensible for future features)

### AI & External Services
- **Google Generative AI (Gemini)** - Free AI API for generating personalized study schedules
- **Vercel** - Production hosting with edge functions and serverless functions

### Design Principles
- **Server-Side Rendering (SSR)** - Next.js App Router for better SEO and initial page load performance
- **API Routes** - Serverless functions for backend operations (/api/* endpoints)
- **Environment-based Config** - Separate configs for dev/production
- **Middleware Authentication** - Centralized route protection logic

---

## 📋 Project Structure

```
studyai/
├── app/
│   ├── api/
│   │   ├── generate-schedule/     # AI schedule generation endpoint
│   │   ├── sessions/              # Study sessions CRUD operations
│   │   └── subjects/              # Subject management endpoint
│   ├── dashboard/                 # Protected user dashboard
│   │   ├── layout.tsx             # Dashboard layout
│   │   ├── page.tsx               # Dashboard home
│   │   ├── schedule/              # Study schedule view
│   │   └── subjects/              # Subject management page
│   ├── login/                     # Login page
│   ├── signup/                    # User registration page
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Public home page
│   └── globals.css                # Global styles
├── components/
│   └── DashboardSidebar.tsx       # Navigation sidebar
├── lib/
│   ├── gemini.ts                  # Google Gemini AI client
│   └── supabase/
│       ├── client.ts              # Supabase client for browser
│       └── server.ts              # Supabase client for server
├── middleware.ts                  # Next.js auth middleware
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase account (free tier available)
- Google API key for Gemini (free tier available)

### Step 1 — Clone & Install Dependencies

```bash
git clone https://github.com/yourusername/studyai.git
cd studyai
npm install
```

### Step 2 — Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Settings → API** and copy:
   - **Project URL**
   - **Anon Key** (public API key)

3. Go to **SQL Editor** and run this schema to set up your database:

```sql
-- Create profiles table (auto-synced with auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create subjects table
create table subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  goal text,
  hours_per_week integer default 5,
  color text default '#6366f1',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create study sessions table
create table study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  scheduled_date date not null,
  duration_minutes integer not null,
  topic text,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table subjects enable row level security;
alter table study_sessions enable row level security;

-- RLS Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can manage own subjects" on subjects for all using (auth.uid() = user_id);
create policy "Users can manage own sessions" on study_sessions for all using (auth.uid() = user_id);
```

**Why Row Level Security?** RLS ensures that at the database level, users can only access their own data. This provides an extra security layer beyond application-level checks.

### Step 3 — Get Google Gemini API Key

1. Visit [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → **Create API key in new project**
3. Copy the generated API key

**Why Gemini?** It's free, powerful, and perfect for generating personalized study schedules via the Generative AI API.

### Step 4 — Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase (from Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google Gemini (from Step 3)
GEMINI_API_KEY=your_gemini_api_key_here
```

⚠️ **Important:** 
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for public keys)
- `GEMINI_API_KEY` is used server-side only (API calls happen in `/api/generate-schedule`)
- Never commit `.env.local` to Git

### Step 5 — Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Database Schema

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **profiles** | User information synced with auth | id, full_name, created_at |
| **subjects** | Study subjects | id, user_id, name, goal, hours_per_week, color |
| **study_sessions** | Scheduled study sessions | id, user_id, subject_id, scheduled_date, duration_minutes, topic, completed |

All tables use Row Level Security (RLS) to ensure data isolation per user.

---

## 🔐 Authentication Flow

1. User signs up → `auth.users` record created in Supabase Auth
2. Trigger automatically creates `profiles` entry
3. User logs in → JWT token stored in browser cookies
4. Middleware validates token on protected routes (`/dashboard/*`)
5. Supabase RLS policies enforce data access at database level

---

## 🤖 AI Schedule Generation

**Endpoint:** `POST /api/generate-schedule`

**Process:**
1. User inputs subject, goal, available hours
2. Frontend sends request with subject details
3. Backend calls Google Gemini API
4. Gemini generates personalized study plan
5. Sessions are saved to database
6. UI displays generated schedule

**Why API Route?** Keeping the API key server-side prevents exposure to the browser.

---

## 🚀 Deployment to Vercel

### Option A: GitHub Integration (Recommended)

1. Push your code to GitHub:
```bash
git remote add origin https://github.com/yourusername/studyai.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) and click **New Project**
3. Import your GitHub repository
4. Add environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
5. Click **Deploy** ✨

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

When prompted, enter your environment variables.

**Post-Deployment Checklist:**
- ✅ Test signup/login flow
- ✅ Create a subject and verify it's saved
- ✅ Generate a schedule and verify AI works
- ✅ Check Supabase dashboard for data sync

---

## 🎨 Design Decisions & Architecture

### Why Next.js 14 App Router?
- **Server Components** - Secure database queries on server, no credentials exposed to browser
- **API Routes** - Serverless functions for backend logic (perfect for Vercel deployment)
- **Built-in Middleware** - Centralized authentication logic
- **File-based Routing** - Intuitive folder structure maps directly to URLs
- **Edge Functions Ready** - Can be optimized for edge execution on Vercel

### Why Supabase?
- **PostgreSQL** - Relational data model fits study planning domain
- **Row Level Security** - Database-enforced data isolation (more secure than app-level checks)
- **Built-in Auth** - No need to build authentication from scratch
- **Real-time Subscriptions** - Foundation for future features like live schedule updates
- **Free Tier** - Generous limits for development and small deployments

### Why Google Gemini?
- **Free API** - No billing required for development
- **Powerful LLM** - Generates contextually relevant study plans
- **Structured Output** - Can parse responses to create database entries
- **Fast** - Quick response times for good UX

### Why Middleware Authentication?
- **Centralized Logic** - Single source of truth for route protection
- **Efficient** - Runs before page render, preventing unauthorized access early
- **Cookie Management** - Supabase SSR client handles session persistence
- **Type-Safe** - TypeScript integration with Next.js middleware

### Why Tailwind CSS?
- **Rapid Development** - Build UIs without writing custom CSS
- **Consistency** - Utility-first approach ensures design consistency
- **Small Bundle** - PurgeCSS removes unused styles in production
- **Mobile-First** - Responsive design out of the box

---

## 📝 Available Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm start        # Run production build locally
npm run lint     # Run ESLint
```

---

## 🐛 Troubleshooting

**Issue:** "User not authenticated" on dashboard
- **Solution:** Verify cookies are being saved. Check browser DevTools → Application → Cookies

**Issue:** "GEMINI_API_KEY not found"
- **Solution:** Ensure `.env.local` has the correct key and restart dev server

**Issue:** "Supabase connection failed"
- **Solution:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

**Issue:** RLS policy blocking queries
- **Solution:** Check RLS policies in Supabase dashboard. Ensure `auth.uid()` matches `user_id`

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) - Hosting & deployment platform
- [Supabase](https://supabase.com) - Backend & database
- [Google AI Studio](https://aistudio.google.com) - Gemini API
- [Tailwind Labs](https://tailwindcss.com) - CSS framework
- [Next.js](https://nextjs.org) - React framework

---

## 📧 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Check existing discussions
- Read the troubleshooting section above
4. Deploy! 🎉

---

## 🏗️ Architecture

```
User Browser
     │
     ▼
Vercel (Next.js)
├── /app (Frontend Pages)
│   ├── / (Landing)
│   ├── /login
│   ├── /signup  
│   └── /dashboard
│       ├── /subjects
│       └── /schedule
└── /app/api (Backend API Routes - Serverless)
    ├── /api/subjects
    ├── /api/sessions
    └── /api/generate-schedule  ← Gemini AI
         │
         ▼
    Supabase
    ├── Auth (JWT)
    └── PostgreSQL DB
```

---

## ✨ Features

- 🔐 **Real Authentication** — Signup, Login, Logout via Supabase Auth
- 📚 **Subject Management** — Add subjects with goals and weekly hours
- 🤖 **AI Schedule Generation** — Gemini AI creates personalized weekly plans
- ✅ **Progress Tracking** — Mark sessions complete, view stats
- 📊 **Dashboard** — Overview of all subjects and upcoming sessions
- 🔒 **Row Level Security** — Users only see their own data

---

## 📁 Project Structure

```
studyai/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── subjects/page.tsx
│   │   └── schedule/page.tsx
│   ├── api/
│   │   ├── subjects/route.ts
│   │   ├── sessions/route.ts
│   │   └── generate-schedule/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── gemini.ts
├── components/
│   ├── Navbar.tsx
│   ├── SubjectCard.tsx
│   └── SessionCard.tsx
├── middleware.ts
└── .env.local
```
