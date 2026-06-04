# Synapse Admin Dashboard

Next.js 15 + Tailwind CSS + Supabase — admin web app for managing Synapse universities.

## Setup

### 1. Install dependencies
```bash
cd admin
npm install
```

### 2. Environment variables
Copy the example file and fill in your values:
```bash
cp .env.local.example .env.local
```

Open `.env.local` and set:
```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL (Settings > API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key (Settings > API)
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (Settings > API > service_role)
```

> ⚠️ Never commit `.env.local` — it's gitignored.

### 3. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Sign in
Use your Supabase admin account credentials (the one you created the project with, or any user in your `auth.users` table).

---

## Deploy to Vercel

1. Push the `admin/` folder (or the whole `synapse/` monorepo) to GitHub
2. Create a new Vercel project, set **Root Directory** to `admin`
3. Add the 3 environment variables in Vercel project settings
4. Deploy

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Admin sign-in |
| `/dashboard` | Overview stats + recent universities |
| `/universities` | Add / remove allowed email domains |
| `/students` | View all registered students |

---

## Supabase permissions needed

The service role key bypasses RLS, so the Students page (which joins `profiles` + `allowed_domains`) works without extra grants. The Universities page uses the anon key + your admin session, so make sure your admin user has the right RLS policies or use the service role for mutations too.

If you want to restrict admin access to specific emails later, add a check in `middleware.ts` against an `admins` table.
