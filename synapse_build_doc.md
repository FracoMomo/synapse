# SYNAPSE — Build Documentation
> Living document. Update as we progress.

---

## App Overview
- **Platform:** Mobile (iOS + Android via React Native / Expo)
- **Target:** Filipino university students (university domain allowlist — e.g. cit.edu, usc.edu.ph, dlsu.edu.ph)
- **Tagline:** Where Campus Life Syncs.
- **Pillars:** Connect. Schedule. Socialize.

---

## Screen Inventory

### 1. Lobby (Home Tab)
- Feed of active Lobby cards
- Each card shows: title, host, type badge (year level or "Any"), time, venue, capacity (X joined / X total), Join or Leave button
- "View All Activities" expand button
- Academic Sync banner (MS Teams next deliverable + due time)
- Intramurals Scoreboard banner (LIVE)
- Filter and grid view toggle (top right)

### 2. Create Lobby (FAB "+" button — center nav)
**Step 1 — Type**
- "What kind of lobby?" grid selector
- Options (7 types, each color-coded):
  | Type | Color |
  |------|-------|
  | Study Block | Electric Blue `#3D5AFE` |
  | Campus Event | Purple `#7C3AED` |
  | Student Event | Orange `#F59E0B` |
  | Sports & Fitness | Green `#10B981` |
  | Review Session | Sky Blue `#06B6D4` |
  | Hobby & Interest | Pink `#EC4899` |
  | Open Presentation | Red `#EF4444` |

**Step 2 — Details**
- Selected type shown at top
- Time: quick-select chips (2PM, 4PM, 6PM, 8PM)
- Venue: selectable list (Library, CCS Lab, CBA Lounge, Online/Zoom)
- Capacity: slider with +/- controls

**Step 3 — Launch (Summary)**
- Lobby summary card: Type, Time, Venue, Capacity
- Back button + "🚀 Launch Lobby" CTA

**Success State**
- Green checkmark
- "Lobby Launched! 🚀"
- Subtitle confirms type + venue
- "Create Another" button

### 3. Discover Tab
**Tab switcher: Events | People | Syncs**

**Events (default)**
- Category filter chips matching the 7 lobby types:
  All, Campus Event, Student Event, Sports & Fitness, Review Session, Hobby & Interest, Open Presentation
- "All" chip is white with blue border when active
- Event cards: title, organizer, date/time, venue, attendance progress bar, RSVP button

**People**
- Search bar: "Find a designer, tutor..."
- Filter chips: All, Design, Tutoring, Video, Dev, Writing, Photo
- Student freelancer cards:
  - Avatar + Name
  - Verified badge (premium ₱29 users — pinned to top)
  - Skill tags
  - Star rating + review count
  - "View Profile" button

**Syncs (NEW)**
- A persistent, asynchronous collab board — distinct from lobbies (which are real-time/scheduled)
- Filter chips: All, Paid, Collab, Volunteer
- Sync cards:
  - Type badge (Paid / Collab / Volunteer) + budget if paid
  - Title + description
  - Skill tags
  - Poster info (avatar, name, course)
  - Applicant count
  - "Apply →" button
- Future: post a Sync from this tab

### 4. Calendar Tab
- Weekly strip date picker (Mon–Sun)
- Daily timeline of events with time labels
- Color-coded left border per event type
- Status badges: "NOW" (current class), "DUE" (deadline)
- Pulls academic deadlines from MS Teams via Microsoft Graph API

### 5. Profile Tab
- Avatar + Name
- Year level, course, university email
- "View My Portfolio" button
- Stats row: Sessions | Joined | Hosted
- Menu items: My Classes, Saved Activities, Notifications, Settings

### 6. My Portfolio (from Profile)
**Own view:**
- Skill tags (Graphic Design, Video Editing, Tutoring, UI/UX Design)
- Portfolio items: thumbnail, title, category badge, "Inquire" button

**Public/other user view:**
- Header card: avatar, name, Verified badge, email, star rating
- "Commission / Hire" CTA button
- Skills section
- Portfolio items
- Peer Reviews section (reviewer name, star rating, comment)

---

## Global Header (all screens)
- University logo + name (left)
- Verified badge + .edu domain (center)
- Next Class time (right)
- Notification bell with badge (far right)

## Bottom Navigation
| Tab | Icon | Notes |
|-----|------|-------|
| Lobby | Home | Default landing screen |
| Discover | Search | Events + People + Syncs tabs inside |
| Create | "+" FAB | Center, elevated, blue |
| Calendar | Calendar | MS Teams synced |
| Profile | Person | Links to Portfolio |

---

## Design System
- **Theme:** Light mode primary, dark background on outer shell
- **Primary color:** Blue (#3D5AFE)
- **Lobby type colors:** see table in Create Lobby section above
- **Typography:** Clean sans-serif, strong hierarchy
- **Cards:** White with subtle shadow, rounded corners
- **Badges:** Pill-shaped, color-coded by year level / category
- **Filter chips:** Active = filled color; "All" chip = white bg + blue border when active

---

## Tech Stack (Planned)
| Layer | Tool |
|-------|------|
| Frontend / App | React Native (Expo) |
| Auth + Database | Supabase |
| Email Domain Gating | Supabase Auth + university domain allowlist table |
| Calendar Sync | Microsoft Graph API |
| Payments | PayMongo (GCash + cards) |
| Hosting | Vercel (web) + Expo (mobile) |

---

## Supabase Schema Notes
- `allowed_domains` — university domain allowlist; has `id (uuid)`, `domain`, `university_name`
- `profiles` — has `university_id (uuid FK → allowed_domains.id)`; no `university` text column — name resolved at runtime via separate query on `allowed_domains`
- `lobbies` — has `university_id (uuid FK → allowed_domains.id)`
- RLS enabled on `profiles`, `lobbies`, `allowed_domains`
- JWT hook (`custom_access_token_hook`) injects `university_id` into every login token so RLS policies can filter by university
- `supabase_auth_admin` granted SELECT on `profiles` for the JWT hook to work
- Multi-campus support deferred — revisit when a multi-campus university onboards (Option A: separate domain per campus; Option B: add `campus_id` column)
- `portfolios` — `id (uuid)`, `student_id (uuid FK → profiles.id)`, `skill_tags (text[])`, `average_rating (numeric)`, `review_count (int)` — one row per student (FK is student_id not user_id)
- `portfolio_items` — `id`, `portfolio_id (uuid FK → portfolios.id)`, `title`, `category`, `image_url`, `hero_image_url`, `proof_image_urls (text[])`, `created_at` — many per portfolio
- `gallery_items` — `id`, `user_id (uuid FK → profiles.id)`, `title`, `category`, `category_color`, `image_url`, `created_at` — direct FK to profiles (NOT portfolios)
- `peer_reviews` — `id`, `portfolio_id (uuid FK → portfolios.id)`, `reviewer_id (FK → profiles.id)`, `rating (int 1–5)`, `comment (text)`, `created_at`

---

## Monetization
| Tier | Who Pays | Price | What They Get |
|------|----------|-------|---------------|
| B2B SaaS | University admin | ₱50–100/student/year | Campus network license |
| B2C Free | General students | Free | Core app (school-subsidized) |
| B2C Premium | Power users / freelancers | ₱29/month | Verified badge, pinned in Talent directory, peer-review system |

---

## Build Phases
- [x] **Phase 1** — Auth + email gating + basic profile
- [x] **Phase 2** — Lobby feed + Create Lobby flow
- [x] **Phase 3** — Discover (Events + People + Syncs tabs)
- [x] **Phase 4** — Calendar + MS Teams sync
- [x] **Phase 5** — Portfolio + peer reviews
- [x] **Phase 5.5** — In-app onboarding
- [x] **Phase 6** — Supabase Storage (real images for portfolios, banners, avatars)
- [x] **Phase 6.1** — Portfolio data persistence fix (real DB fetch replaces mock data)
- [x] **Phase 6.2 (Pre-7)** — Polish pass before admin dashboard
- [x] **Phase 7** — Admin dashboard (B2B)
- [ ] **Phase 8** — Pilot launch (1 university)

---

## Decisions Log
| Date | Decision |
|------|----------|
| 2026-05-26 | Talent/Hire directory merged into Discover tab as "People" sub-tab (keeps nav at 5 tabs) |
| 2026-05-27 | Supabase anon key requires explicit GRANT SELECT for RLS tables |
| 2026-05-27 | Email confirmation redirect (localhost:3000) to be fixed in Phase 6 with proper redirect URL |
| 2026-05-27 | Added "Syncs" as 3rd tab in Discover — async collab board, distinct from real-time lobbies |
| 2026-05-27 | Lobby types updated from 6 → 7: Study Block, Campus Event, Student Event, Sports & Fitness, Review Session, Hobby & Interest, Open Presentation |
| 2026-05-27 | Each lobby type has a dedicated color (see Create Lobby section) |
| 2026-05-27 | Multi-campus support deferred until a multi-campus school onboards |
| 2026-05-27 | "Syncs" chosen as tab name over "Collabs", "Gigs", "Projects" — ties into tagline "Where Campus Life Syncs" |
| 2026-05-27 | university_id UUID FK added to profiles + lobbies; JWT hook injects it into login token for RLS |
| 2026-05-27 | Phase 4 complete: CalendarScreen built with weekly strip, daily timeline, NOW/DUE badges, MS Teams connect banner |
| 2026-05-27 | CalendarEvent type uses dateOffset (relative to today) so mock data is always temporally correct |
| 2026-05-27 | MS Graph service scaffolded in src/lib/msGraph.ts — Azure app registered, client ID set, redirect URIs configured |
| 2026-05-27 | Azure app: multitenant (Any Entra ID Tenant + Personal Microsoft accounts), public client flows enabled |
| 2026-05-27 | Redirect URIs registered: https://auth.expo.io/sebastiancam0r0/synapse + exp://localhost:8081 |
| 2026-05-27 | OAuth activation (expo-auth-session + token flow) deferred to Phase 6 — scaffold fully ready |
| 2026-05-27 | Auth UX improvements: Remember Me checkbox, eye toggle (Ionicons), custom bullet masking for password (secureTextEntry=false, manual • display for cross-platform peek control) |
| 2026-05-27 | Supabase client now uses AsyncStorage (persistSession: true) — sessions survive app restarts |
| 2026-05-27 | Remember Me off = session works for current launch only (AsyncStorage key cleared post-login) |
| 2026-05-27 | Peek-a-boo: last typed character shows 600ms then masks — implemented via displayValue state + passwordRef, avoids Android secureTextEntry flicker bug |
| 2026-05-28 | Phase 5 complete: ProfileScreen, PortfolioScreen (own + public view), peer reviews with modal, all wired via overlay pattern in App.tsx |
| 2026-05-28 | Overlay navigation pattern: overlay state in App.tsx replaces content area with PortfolioScreen; no React Navigation dependency added |
| 2026-05-28 | PortfolioScreen: isOwner=true shows own view (skill tags, items, peer reviews read-only); isOwner=false shows public view (header card, Commission/Hire CTA, write review modal) |
| 2026-05-28 | Peer review modal: star picker (1–5) + text input; optimistic local insert; Phase 6 will write to peer_reviews Supabase table |
| 2026-05-28 | DiscoverScreen People tab “View Profile” now navigates to PortfolioScreen via onViewProfile callback prop |
| 2026-05-28 | New Supabase types added: Portfolio, PortfolioItem, PeerReview |
| 2026-05-28 | New mock data: MOCK_PORTFOLIO_ITEMS (4 items), MOCK_PEER_REVIEWS (3 reviews), MY_SKILL_TAGS |
| 2026-05-28 | PortfolioScreen: banner (160px) + overlapping avatar (72px circular) header; floating back + edit-banner buttons over banner |
| 2026-05-28 | Portfolio items: vertical card with 180px hero image placeholder + horizontal proof-image strip (scrollable, per-item) |
| 2026-05-28 | Gallery of My Works section: 2-column grid of square image tiles between Portfolio and Reviews |
| 2026-05-28 | All image areas are colored-block placeholders; Phase 6 swaps them for <Image source={{ uri }}> from Supabase Storage |
| 2026-05-28 | New Storage buckets to create in Phase 6: banners, avatars, portfolio (hero + proof images), gallery |
| 2026-05-29 | MVP scope locked: payments, B2C/B2B premium features deferred to post-pilot |
| 2026-05-29 | Phase 6 re-scoped: Supabase Storage only (banners, avatars, portfolio images, gallery) |
| 2026-05-29 | MS Teams sync re-scoped to assignment due dates only for MVP (Education API, not calendar) |
| 2026-05-29 | In-app onboarding added (Phase 5.5): 5 slides, AsyncStorage gate, re-accessible from Profile > Account > How Synapse Works |
| 2026-05-29 | App state machine: loading → onboarding → auth → app (onboarding only shown on first launch) |
| 2026-05-29 | Onboarding slides cover: Welcome, Lobbies, Discover, Calendar, Get Started |
| 2026-05-29 | OnboardingScreen re-visit: overlay type added to App.tsx, accessible via Profile menu |
| 2026-05-29 | Phase 6 complete: Supabase Storage wired for all 5 image surfaces |
| 2026-05-29 | New file: src/lib/storage.ts — uploadImage(), getPublicUrl(), deleteImage(), path builders (avatarPath, bannerPath, heroImagePath, proofImagePath, galleryImagePath), pickImage(), captureImage() |
| 2026-05-29 | New file: src/hooks/useImageUpload.ts — useImageUpload() hook (pick + upload + return public URL) |
| 2026-05-29 | Supabase buckets required: avatars, banners, portfolio, gallery (public read, auth write) |
| 2026-05-29 | profiles table: banner_url column added (text, nullable) — run ALTER TABLE in Supabase SQL Editor |
| 2026-05-29 | portfolio_items table: hero_image_url (text) + proof_image_urls (text[]) columns added |
| 2026-05-29 | gallery_items table: image_url (text, nullable) column added |
| 2026-05-29 | AuthContext: setProfile() now exposed in context so screens can sync profile after image uploads |
| 2026-05-29 | ProfileScreen: avatar replaced with real <Image> from avatars bucket; optimistic local update on pick |
| 2026-05-29 | PortfolioScreen: banner uses <ImageBackground> when URL present; avatar uses <Image>; all hero/proof/gallery tiles use <Image> |
| 2026-05-29 | Upload flow: all surfaces use pickAndUpload() → Supabase Storage → update DB row → optimistic state update |
| 2026-05-29 | Per-surface aspect ratios: avatar [1,1], banner [16,5], hero [16,9], proof [4,3], gallery [1,1] |
| 2026-05-29 | All upload spinners are in-place (ActivityIndicator) so UX never leaves the screen during upload |
| 2026-05-29 | Fixed: Android cannot fetch() file:// URIs — switched to expo-file-system/legacy readAsStringAsync + base64 decode |
| 2026-05-29 | Fixed: expo-file-system v54 deprecated top-level import — use expo-file-system/legacy instead |
| 2026-05-29 | Fixed: ImagePicker.MediaTypeOptions deprecated — replaced with ['images'] array syntax |
| 2026-05-29 | Fixed: profiles table missing GRANT for authenticated role — ran GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated |
| 2026-05-29 | Fixed: banner_url and avatar_url columns added to profiles table via ALTER TABLE ADD COLUMN IF NOT EXISTS |
| 2026-05-29 | All 5 image surfaces confirmed working on Android: avatar, banner, portfolio hero, proof images, gallery tiles |
| 2026-05-31 | Phase 6.1: portfolio images now persist across app relaunches |
| 2026-05-31 | Root cause: MOCK_PORTFOLIO_ITEMS/MOCK_GALLERY_ITEMS had mock IDs that never matched real DB rows — DB updates were silently no-ops |
| 2026-05-31 | Fix: new hook src/hooks/usePortfolio.ts fetches portfolio_items, gallery_items, peer_reviews, portfolios from Supabase on mount |
| 2026-05-31 | usePortfolio returns initialHeroUrls, initialProofUrls, initialGalleryUrls maps — PortfolioScreen seeds its image state from these on load |
| 2026-05-31 | PortfolioScreen: MOCK_* imports replaced with usePortfolio(); loading skeleton shown while fetching |
| 2026-05-31 | handleReviewSubmit now writes to peer_reviews table (was local state only in Phase 6) |
| 2026-05-31 | Proof image upload now appends to proof_image_urls array in DB (fetch existing array + concat + update) |
| 2026-05-31 | Avatar and banner were already persisting correctly (written to profiles table) — unchanged |
| 2026-05-31 | Skill tags now pulled from portfolios.skill_tags column; falls back to MY_SKILL_TAGS constant if DB row is empty |
| 2026-05-31 | Schema correction: portfolio_items and gallery_items use portfolio_id FK (not user_id) — build doc was wrong |
| 2026-05-31 | Schema correction: peer_reviews uses portfolio_id FK (not reviewee_id) — build doc was wrong |
| 2026-05-31 | usePortfolio fetch order fixed: portfolios row fetched first to get portfolio_id, then portfolio_items/gallery_items/peer_reviews all filtered by portfolio_id |
| 2026-05-31 | PortfolioScreen upload handlers fixed: all DB updates use portfolio_id instead of user_id |
| 2026-05-31 | Tab switch image wipe bug fixed: renderScreen() switch was remounting screens on every tab change, destroying all local state |
| 2026-05-31 | Fix: all 4 tab screens now rendered simultaneously in position:absolute slots; inactive screens hidden via display:none (keeps state alive) |
| 2026-05-31 | Old banner reappearing bug was same root cause — localAvatarUri state was reset to null on remount, falling back to stale AuthContext value |
| 2026-05-31 | Schema audit: portfolios.student_id (not user_id), gallery_items.user_id direct to profiles (not portfolio_id), peer_reviews.portfolio_id |
| 2026-05-31 | supabase.ts types updated to match real DB schema: Portfolio, PortfolioItem, GalleryItem, PeerReview all corrected |
| 2026-05-31 | usePortfolio: portfolios query changed to .eq('student_id', userId); gallery_items query changed to .eq('user_id', userId) |
| 2026-05-31 | Gallery upload handler changed from UPDATE to INSERT for new items; calls refetchPortfolio() after insert so grid updates |
| 2026-05-31 | Discovered profiles.university column does not exist in DB — university name must be resolved from allowed_domains via separate query |
| 2026-05-31 | AuthContext.fetchProfile changed: plain profiles select + separate allowed_domains query by university_id to resolve name |
| 2026-05-31 | AuthContext.signUp fixed: removed insert of non-existent university column, only inserts university_id |
| 2026-05-31 | Profile row was missing entirely (signUp insert had been failing silently) — manually inserted via SQL |
| 2026-05-31 | portfolios row manually inserted via SQL since no app flow creates it yet — Phase 6.2 will auto-create on signup |
| 2026-05-31 | GRANT SELECT ON allowed_domains TO authenticated — required for university name resolution |
| 2026-05-31 | GRANT SELECT/INSERT/UPDATE/DELETE on portfolio_items, gallery_items, portfolios, peer_reviews TO authenticated |
| 2026-05-31 | Avatar and banner confirmed working end-to-end after schema + RLS fixes |
| 2026-05-31 | Gallery upload confirmed working: inserts new gallery_items row, refetches, image appears in grid |
| 2026-05-31 | Starting Phase 6.2 — polish pass before Phase 7 admin dashboard |
| 2026-05-31 | BottomNav rebuilt: Ionicons instead of emojis, floating FAB (+) centered in bar, useSafeAreaInsets for Android nav bar clearance |
| 2026-05-31 | SafeAreaProvider added to App.tsx root — required for useSafeAreaInsets to work |
| 2026-05-31 | GlobalHeader rebuilt: useSafeAreaInsets for status bar clearance, Ionicons bell, university name + email with ellipsis truncation |
| 2026-05-31 | GlobalHeader: university name auto-derived from allowed_domains via AuthContext on login — shows correct school name |
| 2026-05-31 | GlobalHeader: shortName initials auto-derived from university name words (filters short words like 'of', 'de') |
| 2026-05-31 | AuthContext: fetchProfile now awaited before setLoading(false) — prevents header flash with wrong initials on launch |
| 2026-05-31 | allowed_domains: fixed typo 'Cebu Institue of College University' → 'Cebu Institute of Technology University' |
| 2026-05-31 | Portfolio avatar zIndex fix: avatarWrapper zIndex:10 so identity block white bg doesn't cover bottom half of avatar |
| 2026-05-31 | PortfolioScreen banner/avatar spacing tightened: bannerContainer marginBottom:0, avatarWrapper bottom:-(AVATAR_SIZE/2) |
| 2026-05-31 | Marquee animation attempted and removed — React Native layout constraints make reliable cross-platform text ticker too fragile |
| 2026-05-31 | Tab overlay fix: PortfolioScreen overlay now uses display:none toggle (not conditional render) so it stays mounted and image state survives |
| 2026-05-31 | Phase 6.2 in progress — remaining items: auto-create profiles+portfolios on signup, Edit Profile flow, wire Add Item button, remove debug console.log |
| 2026-06-01 | Phase 6.2 complete — all 4 polish items shipped |
| 2026-06-01 | Auto-create profiles+portfolios on signup: switched from INSERT to upsert (onConflict) on both tables to avoid duplicate-key errors on re-registration |
| 2026-06-01 | fetchProfile safety net: PGRST116 (no rows) now handled gracefully; portfolios row auto-created via upsert on every sign-in if missing (covers pre-6.2 accounts) |
| 2026-06-01 | Edit Profile flow: EditProfileModal was already built but unwired; wired to new ✎ Edit Profile button on ProfileScreen header card; saves full_name, course, year_level to profiles and syncs AuthContext |
| 2026-06-01 | Portfolio CTA row redesigned: ✎ Edit Profile (outlined) + 🎨 Portfolio (filled) side by side — cleaner than stacked buttons |
| 2026-06-01 | + Add Item button in PortfolioScreen now opens AddPortfolioItemModal (title input, category chip selector, optional description); INSERTs to portfolio_items and calls refetchPortfolio() on success |
| 2026-06-01 | Removed debug console.log('[gallery] pickAndUpload returned:', url) from handleGalleryUpload |
| 2026-06-01 | Phase 7 next: Admin Dashboard (B2B web app) |
| 2026-06-04 | Fixed: Universities page Add/Delete gave `permission denied` — two stacked issues: (1) module-level `createClient()` ran before env vars populated so service key was undefined and anon key was used instead; fixed by moving client creation inside each action via `getServiceClient()` factory. (2) `service_role` lacked Postgres table privileges on `allowed_domains` — fixed by running `GRANT SELECT, INSERT, UPDATE, DELETE ON public.allowed_domains TO service_role` in SQL Editor. Service role bypasses RLS but still needs explicit table-level GRANTs. |
| 2026-06-04 | Removed hardcoded "Active" status badge from Universities table — no `is_active` column exists on `allowed_domains`; deferred to Phase 8 when university suspension becomes a real need |
| 2026-06-04 | Students page: fixed module-scope `createClient` bug (same as universities); added `auth.admin.listUsers` to fetch emails; added university filter chips + search bar via `StudentsClient` component; added Joined date column; `GRANT SELECT ON public.profiles TO service_role` required |
| 2026-06-04 | Dashboard page: fixed module-scope `createClient` bug; wired real Growth stat (new signups this month vs last month, shown as +/- diff with subtitle); removed hardcoded "Active" badge from Recent Universities list; replaced with added date |
| 2026-06-04 | Universities page: added `is_active` column to `allowed_domains` (boolean, default true); added disable/enable toggle (`PowerOff`/`Power` icons); delete now checks for linked students first and returns friendly error instead of raw FK violation; inline error row shown under the offending university row; `toggleUniversity` server action added |

---

## Deferred / Come Back Later
> Things that are scaffolded or noted but intentionally not built yet. Revisit at the right phase.

| Item | Context | Target Phase |
|------|---------|-------------|
| Make `is_active` on `allowed_domains` actually enforce access | Currently only a visual toggle in the admin dashboard. To make it real: (1) update `check_allowed_domain` trigger to also check `is_active = true` on new signups, (2) add RLS policy referencing `is_active` to block existing students from a disabled university from logging in | Phase 8 |
| Multi-campus support | Deferred until a multi-campus university onboards. Option A: separate domain per campus. Option B: add `campus_id` column to `profiles` and `lobbies` | Phase 8+ |
| MS Teams OAuth activation | `expo-auth-session` + token flow scaffolded in `src/lib/msGraph.ts`. Azure app registered, redirect URIs set. Deferred from Phase 4 | Post-pilot |
| B2C Premium tier (₱29/month) | Verified badge, pinned in Talent directory, peer-review system. Requires PayMongo integration | Post-pilot |
| B2B SaaS university admin dashboard | Each university gets their own admin login to manage their campus (separate from the current super-admin dashboard) | Phase 8+ |
| JWT hook (`custom_access_token_hook`) | Currently disabled in Supabase dashboard. Re-enable for multi-university RLS filtering when more than one school is live | Phase 8 |