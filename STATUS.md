# MediCareer Agent — work done 19 July 2026

Everything below is **committed locally only**. Nothing has been published to
agent.tmla.com.sa — there is no deployment path from this machine (no deploy script,
no git remote, no Manus CLI). The final Publish has to come from your Manus account.

Verified green: `tsc --noEmit` passes, **49 tests** pass, `vite build` succeeds.

---

## The headline: your doctor dashboard was completely broken in production

Any doctor who logged in and opened `/dashboard` got a full-page error:

```
ReferenceError: require is not defined
```

`Dashboard.tsx` called `require('@/lib/jobManagement')` inside a render function.
`require` does not exist in a browser bundle, so the whole page threw and the error
boundary replaced it. Confirmed live on the production site, then fixed and verified.

This is almost certainly the "problem" you were seeing. It made the core product
unusable for every logged-in doctor.

---

## Part 1 — Bugs fixed

| Fix | Severity |
|-----|----------|
| Doctor dashboard crash (`require is not defined`) | **Critical** — page was dead |
| Restored `client/src/lib/jobManagement.ts`, missing from the export | **Critical** — could not build |
| Restored `client/src/_core/hooks/useAuth.ts`, missing from the export | High |
| `/admin` was open to anyone who typed the URL | High |
| Returning applicants' applications were orphaned under a fake user id | High |
| Login page displayed working admin credentials (`admin123`) | Medium |
| Broken character in the page `<title>` | Low |

### The two missing files

The zip you downloaded from Manus is missing `jobManagement.ts` — the export itself is
incomplete, so re-downloading will not help. I reconstructed it from your live
JavaScript bundle; `/admin/jobs` renders identically to production and the build output
matches production size to within 0.4%. `useAuth.ts` came from your `medpath-uk`
project, which uses the same template.

**If you can get the real `jobManagement.ts` out of the Manus editor, send it** — mine
is faithful but reconstructed.

---

## Part 2 — The backend (new)

The app previously stored everything in the visitor's own browser, so nothing a doctor
submitted ever reached you. There is now a real server side.

### Database

`drizzle/0001_purple_magdalene.sql` — **additive**. It creates four new tables
(`applications`, `documents`, `messages`, `adminNotes`) and only *alters* `users` to add
`passwordHash` and a unique index on `email`. Your existing `users` table and its rows
are untouched.

### Authentication

Email + password, over tRPC: `auth.register`, `auth.login`, `auth.logout`, `auth.me`.

- Passwords hashed with **scrypt** from Node's standard library — no native dependency
  to build, nothing extra to install.
- Login hashes a dummy value when the email is unknown, so a wrong email and a wrong
  password take the same time and return the same message. Neither reveals whether an
  account exists.
- The session is a signed JWT in an **httpOnly cookie**. Identity now comes from the
  server; editing browser storage no longer makes you an admin.
- Issuing a session **refuses to run if `JWT_SECRET` is unset**, rather than quietly
  signing with an empty key that anyone could forge.

### Applications API

Doctors read and write only their own application. Every per-application procedure goes
through a single ownership check, and another user's application is reported as "not
found" — identical to a genuinely missing one, so ids cannot be probed.

Admin-only: status changes, readiness guidance, and internal notes. **Internal notes are
never returned to a doctor.** A message's sender is taken from the session, not the
request body, so a doctor cannot post a message that appears to come from a consultant.

### Tests

49 passing, covering password hashing, timing-equal login, ownership boundaries,
admin-only access, and internal-note leakage. I checked the suite is actually meaningful
by deleting the ownership check and confirming exactly the five relevant tests failed.

---

## Sign-in links (no passwords to forget)

A doctor who applies never has to remember a password. They enter their email, we send
a one-time sign-in link, they click it, they are in.

- The link is a 256-bit random secret. Only its **SHA-256 is stored**, so reading the
  database does not yield working links — there is a test asserting the stored hash
  cannot be used as a token.
- **Works once.** Redeeming clears it, so a forwarded or re-clicked link is dead.
  Verified by deleting that line and confirming the test fails.
- **Expires in 15 minutes.**
- Requesting a new link invalidates the previous one.
- Asking for a link reports success **whether or not the address has an account** — the
  page must not become a way to check which doctors are registered with you.

Failed links land back on `/login` with a plain explanation, never a stack trace.

---

## To make this live — three things, in order

**1. Set environment variables in Manus**

| Variable | Value |
|---|---|
| `DATABASE_URL` | your MySQL connection string |
| `JWT_SECRET` | a long random string — this signs session cookies |
| `ADMIN_EMAILS` | **your email**, e.g. `healthcarequalityschool@gmail.com` |
| `RESEND_API_KEY` | from your Resend account — sends the sign-in links |
| `EMAIL_FROM` | e.g. `MediCareer Agent <no-reply@hcqsai.uk>` |

`ADMIN_EMAILS` matters: roles default to `user`, and only an admin can grant admin — so
without it **nobody can reach `/admin`**, including you. Any email listed here is
promoted to admin when it registers or signs in. It never demotes anyone.

On `EMAIL_FROM`: your Resend account has three verified domains — `hcqs.ai`,
`hcqscongress.com`, `hcqsai.uk`. None matches `tmla.com.sa` or `medicareeragent.com`.
`hcqsai.uk` is the closest fit, but **sending sign-in links from a domain unrelated to
the site hurts both deliverability and trust** — a doctor sees a link from an unfamiliar
sender. Worth verifying a matching domain in Resend before launch.

Without `RESEND_API_KEY`, everything else still works; link requests are logged as
skipped instead of sent, so nothing crashes in development.

**2. Run the migrations** — `pnpm db:push`, or apply `0001_purple_magdalene.sql` then
`0002_lively_madame_hydra.sql`. Both are additive.

One caveat: `0001` adds a unique index on `users.email`. If your `users` table already
contains two rows with the same email, that statement fails and you will need to clear
the duplicate first. With no real users yet this should be fine.

**3. Register your own account** on the live site with the email you put in
`ADMIN_EMAILS`. That becomes your admin login, replacing `admin123`.

---

## What is and is not server-backed yet

| Area | State |
|---|---|
| Registration, login, sessions, roles | ✅ server |
| Sign-in links by email | ✅ server, tested |
| Applications / documents / messages **API** | ✅ server, tested |
| Apply form and Dashboard **UI** | ⚠️ still localStorage |
| Admin tools (jobs, queue, follow-up) | ⚠️ still localStorage |

I stopped the frontend migration at auth deliberately. Moving the Apply form and
Dashboard across also means building file upload to object storage, and I cannot verify
any of it without a database or storage credentials — writing a large untested migration
of your main conversion funnel seemed worse than stopping at a coherent point.

The three places that still feed a user id into the old browser store are converted at
the boundary and commented, so the app is consistent today rather than half-migrated.

**Next step, when you have a database:** move the Apply form and Dashboard onto the
applications API and add document upload. The API they need already exists and is tested.

---

## Still open — needs your decision

### 1. How do you publish?

Still unanswered, and it blocks everything above from reaching real users.

---

## Two things I corrected about my own earlier report

1. I said the homepage counters (500+, 92%) were broken. **They are not.** They animate
   correctly — my automated checks were reading a background browser tab, where Chrome
   pauses that animation.
2. I implied an open `/admin` exposed doctors' data. It did not — because all data lived
   in each visitor's own browser, `/admin` only ever showed the seeded demo record. Worth
   gating, which I did, but it was not a data breach.

I also checked whether large uploads silently fail against the browser storage limit.
**They do not** — 8 × 3 MB documents saved fine. Not a bug.

---

## Running it locally

This machine has no system Node. Use the portable copy:

```powershell
$n='C:\Users\cqips_cqi\Desktop\New folder\tools\node-v22.18.0-win-x64'
$env:Path="$n;$env:Path"; $env:COREPACK_ENABLE_DOWNLOAD_PROMPT='0'
& "$n\node.exe" "$n\node_modules\corepack\dist\corepack.js" pnpm install
```

Then, from Git Bash:

```bash
NODE_ENV=development JWT_SECRET=local-dev-secret \
  node node_modules/tsx/dist/cli.mjs server/_core/index.ts
```

→ http://localhost:3000 (falls back to the next free port). Without `DATABASE_URL`,
register and login correctly report "Database is not configured" instead of failing
silently.

I also ran `git init` and committed a baseline first — the project had no version control
at all. `git log` shows each change separately, and `git diff 2d7e769` shows everything.
