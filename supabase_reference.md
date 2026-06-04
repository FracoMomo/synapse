# Synapse — Supabase Backend Reference

> Temporary reference doc for Claude. Keep updated as schema evolves.
> Last updated: 2026-06-04

---

## Project Credentials

| Key | Value |
|-----|-------|
| Project URL | `https://zqxvzyqopszkjfbafmmu.supabase.co` |
| Anon/Public Key (legacy JWT) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxeHZ6eXFvcHN6a2pmYmFmbW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDMxNzcsImV4cCI6MjA5NTM3OTE3N30.O770c7t644fK4JTB7tGA56Wdd_rHLldD3CbROhwD5kM` |
| Service Role Key | stored in `admin/.env.local` — never commit |
| Session Storage Key (mobile) | `sb-zqxvzyqopszkjfbafmmu-auth-token` |

---

## Database Schema

### `allowed_domains`
Controls which university email domains can register on Synapse.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `domain` | text | e.g. `cit.edu` — no `@` prefix |
| `university_name` | text | e.g. `Cebu Institute of Technology University` |
| `is_active` | boolean | default true — toggle to disable without deleting |
| `created_at` | timestamptz | |

> ⚠️ RLS enabled. Admin dashboard uses service role key to bypass RLS for reads/writes.

---

### `profiles`
One row per registered user. Created on signup via `AuthContext.signUp()` upsert.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | = `auth.users.id` |
| `university_id` | uuid FK → `allowed_domains.id` | NOT a text column — name resolved at runtime |
| `full_name` | text | nullable |
| `course` | text | nullable |
| `year_level` | text | nullable |
| `bio` | text | nullable |
| `avatar_url` | text | nullable — Supabase Storage `avatars` bucket |
| `banner_url` | text | nullable — Supabase Storage `banners` bucket |
| `is_premium` | bool | default false |
| `sessions_count` | int | |
| `joined_count` | int | |
| `hosted_count` | int | |
| `created_at` | timestamptz | |

> ⚠️ There is NO `university` text column — always resolve name via separate query on `allowed_domains` using `university_id`.

**Grants required:**
```sql
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
```

---

### `portfolios`
One row per student. Created on signup or on first sign-in (safety net in `fetchProfile`).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `student_id` | uuid FK → `profiles.id` | ⚠️ NOT `user_id` |
| `skill_tags` | text[] | |
| `average_rating` | numeric | |
| `review_count` | int | |
| `created_at` | timestamptz | |

> ⚠️ FK is `student_id`, not `user_id`. Unique constraint on `student_id` required for upsert:
> ```sql
> ALTER TABLE portfolios ADD CONSTRAINT portfolios_student_id_key UNIQUE (student_id);
> ```

---

### `portfolio_items`
Many per portfolio.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `portfolio_id` | uuid FK → `portfolios.id` | |
| `title` | text | |
| `category` | text | e.g. Design, Dev, Video, Writing, Photo, Tutoring, UI, UX, Other |
| `image_url` | text | nullable |
| `hero_image_url` | text | nullable — Supabase Storage `portfolio` bucket |
| `proof_image_urls` | text[] | nullable — array of proof image URLs |
| `description` | text | nullable |
| `created_at` | timestamptz | |

---

### `gallery_items`
Many per user. Direct FK to `profiles`, NOT via `portfolios`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → `profiles.id` | ⚠️ Direct FK, NOT `portfolio_id` |
| `title` | text | |
| `category` | text | |
| `category_color` | text | hex color string |
| `image_url` | text | nullable — Supabase Storage `gallery` bucket |
| `created_at` | timestamptz | |

---

### `peer_reviews`
Many per portfolio.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `portfolio_id` | uuid FK → `portfolios.id` | ⚠️ NOT `reviewee_id` |
| `reviewer_id` | uuid FK → `profiles.id` | |
| `rating` | int | 1–5 |
| `comment` | text | |
| `created_at` | timestamptz | |

---

### `lobbies`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `title` | text | |
| `type` | text | one of 7 lobby types |
| `host_id` | uuid FK → `profiles.id` | |
| `university_id` | uuid FK → `allowed_domains.id` | for RLS filtering per university |
| `venue` | text | |
| `lobby_time` | text | |
| `capacity` | int | |
| `joined_count` | int | |
| `year_level_filter` | text | |
| `is_active` | bool | |
| `created_at` | timestamptz | |

---

## Storage Buckets

| Bucket | Used For | Path Pattern |
|--------|----------|--------------|
| `avatars` | Profile avatars | `{userId}/avatar.{ext}` |
| `banners` | Portfolio banners | `{userId}/banner.{ext}` |
| `portfolio` | Hero + proof images | `{userId}/{portfolioItemId}/hero.{ext}` |
| `gallery` | Gallery tiles | `{userId}/gallery/{timestamp}.{ext}` |

All buckets: **public read, authenticated write**.

---

## Auth

### Domain Gating
- Trigger `enforce_allowed_domain` on `auth.users` BEFORE INSERT
- Calls `check_allowed_domain()` function
- Rejects emails whose domain is not in `allowed_domains.domain`
- ⚠️ Admin user (`lolcool8000.camoro@gmail.com`) was inserted by dropping this trigger temporarily

### JWT Hook
- Hook name: `Customize Access Token (JWT) Claims hook`
- Function: `public.custom_access_token_hook`
- Status: **DISABLED** in Supabase dashboard
- What it does: injects `university_id` into JWT claims so RLS can filter by university
- Currently disabled — may need to re-enable for multi-university RLS in Phase 8

### Admin Auth User
- Email: `lolcool8000.camoro@gmail.com`
- Created manually via SQL (bypassing domain trigger)
- Has a `profiles` row with `id = ca28d307-237f-4eeb-a83d-889380bf9beb`
- Allowlisted in `admin/middleware.ts` → `ADMIN_EMAILS`
- Also allowlisted: `sebastianfranco.camoro@cit.edu` (dev/test account)

---

## RLS Policies Summary

| Table | Policy | Notes |
|-------|--------|-------|
| `profiles` | Users can read/write own row | `auth.uid() = id` |
| `portfolios` | Users can read/write own row | `auth.uid() = student_id` |
| `portfolio_items` | Users can read/write own items | via `portfolio_id` join |
| `gallery_items` | Users can read/write own items | `auth.uid() = user_id` |
| `peer_reviews` | Anyone can read, auth users can insert | |
| `allowed_domains` | Public read | authenticated users can read to validate domain |
| `lobbies` | University-scoped via `university_id` | |

**Required grants (run in SQL Editor if missing):**
```sql
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.peer_reviews TO authenticated;
GRANT SELECT ON public.allowed_domains TO authenticated;
GRANT SELECT ON public.allowed_domains TO supabase_auth_admin;
```

---

## Admin Dashboard (`admin/`)

### Stack
- Next.js 15 (App Router) + Tailwind CSS v3 + `@supabase/supabase-js` 2.45.4
- Located at `C:\Users\Franco Camoro\synapse\admin\`

### Key Files
| File | Purpose |
|------|---------|
| `admin/middleware.ts` | Route protection — allowlist check via `ADMIN_EMAILS` |
| `admin/lib/supabase.ts` | Server-side Supabase client (service role) |
| `admin/lib/supabase-browser.ts` | Client-side Supabase client (anon key, hardcoded) |
| `admin/app/actions/universities.ts` | Server actions for add/delete `allowed_domains` |
| `admin/components/LoginForm.tsx` | Raw fetch-based login (bypasses Supabase JS client auth issues) |
| `admin/components/Sidebar.tsx` | Nav sidebar |
| `admin/components/UniversitiesClient.tsx` | Add/delete university domains UI |
| `admin/components/StudentsClient.tsx` | Students table with university filter chips + search |

### Known Issues
- `@supabase/supabase-js` browser client had "No API key found" issues — login uses raw `fetch` to `/auth/v1/token` instead
- Server actions and server components must create Supabase clients inside the function/request, never at module scope — env vars are not available at module evaluation time in Next.js 15

### Required Grants (run in Supabase SQL Editor)
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.allowed_domains TO service_role;
GRANT SELECT ON public.profiles TO service_role;
```

### Routes
| Route | Page |
|-------|------|
| `/login` | Admin sign-in |
| `/dashboard` | Overview stats |
| `/universities` | Manage allowed domains |
| `/students` | View registered students |

---

## Critical Schema Rules (never get these wrong)

1. `profiles.university_id` is a UUID FK — there is **no** `profiles.university` text column
2. `portfolios.student_id` is the FK to `profiles` — **not** `user_id`
3. `gallery_items.user_id` is a direct FK to `profiles` — **not** via `portfolios`
4. `peer_reviews.portfolio_id` is FK to `portfolios` — **not** `reviewee_id`
5. University name is always resolved at runtime: query `allowed_domains` by `university_id`
