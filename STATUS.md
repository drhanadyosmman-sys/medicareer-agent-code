# MediCareer Agent — status

Last updated 20 July 2026. **Merged to `main` and deployed.** Live on
`agent.hcqsai.uk`, database connected.

Verified against the deployed site, not just locally: the `require()` crash is gone from
the shipped bundle, the fabricated figures and testimonials return zero matches, the page
title renders a real em dash, and `auth.requestLoginLink` reaches the database.

---

## Picking this up on another machine

Everything needed lives in this repository. On a new computer:

1. Install [Node.js](https://nodejs.org) 20 or newer, and [Git](https://git-scm.com).
2. `git clone https://github.com/drhanadyosmman-sys/medicareer-agent-code.git`
3. `cd medicareer-agent-code && npm install -g pnpm && pnpm install`
4. Read this file — it is the handover.

What does **not** travel between machines: the Claude Code conversation history and its
local memory. That is why decisions and reasoning are written down here and in the commit
messages rather than left in a chat log. `git log` is the other half of the story — each
commit explains why, not just what.

Secrets are not in the repository and must not be. They live in Manus → Settings →
Secrets; see the table below.

---

## The headline: the doctor dashboard was dead in production

Every doctor who signed in and opened `/dashboard` got a full-page error instead:

```
ReferenceError: require is not defined
```

`Dashboard.tsx` called `require('@/lib/jobManagement')` inside a render function. There is
no `require` in a browser ESM bundle, so the whole page threw and the error boundary
replaced it. Confirmed live, then fixed and verified.

If something felt broken about the site, this was almost certainly it.

---

## What this branch changes

| Fix | Why it mattered |
|---|---|
| Dashboard crash (`require is not defined`) | Core product page was unusable |
| `/admin` open to anyone who typed the URL | The scaffold left a "consider authentication" comment and no guard |
| Removed unsubstantiated success claims | 500+/92%/150+/48h stats, plus three invented testimonials |
| Support email pointed at a dead domain | `medicareeragent.com` has no MX — every support email bounced |
| Page title rendered as `?` | See below — the cause was not what it looked like |
| **New: real backend** | Nothing a doctor submitted previously reached the business |

### The title bug was an encoding fault, not a typo

`client/index.html` was saved in **Windows-1252** while declaring `charset=UTF-8`. The em
dash was a lone `0x97` byte, which is invalid UTF-8, so browsers substituted the
replacement character. The source *looked* correct in most editors, which is why it
survived. Re-encoded as real UTF-8. A scan of every `.ts/.tsx/.html/.json/.css/.md` file
found this was the **only** affected file.

### The backend

- **Tables:** `applications`, `documents`, `messages`, `adminNotes`; `users` gains
  `passwordHash` and login-link columns. Migrations `0001` and `0002` are additive and
  sit on top of the existing `0000_sturdy_stick`, which stays untouched.
- **Registration/login:** email + password, scrypt hashed. Login does equal work for an
  unknown email as for a wrong password, so it cannot be used to find out who is
  registered.
- **Email sign-in links:** one-time, 15-minute expiry, stored only as SHA-256. This
  replaces accounts created with `'temp' + Date.now()` passwords that no doctor was ever
  shown and could never reset.
- **Authorisation:** a doctor can reach only their own application; internal notes never
  leave the admin side; a message's sender comes from the session, not the request body.

Test quality was checked by breaking things on purpose: removing the ownership check
fails exactly 5 tests; removing single-use link enforcement fails exactly 1.

---

## Secrets (all set, 20 July 2026)

Held in Manus -> Settings -> Secrets. Never in this repository.

| Variable | What it is |
|---|---|
| `DATABASE_URL` | MySQL connection string, provisioned by Manus |
| `JWT_SECRET` | signs session cookies |
| `ADMIN_EMAILS` | comma-separated; these addresses get admin on sign-in |
| `RESEND_API_KEY` | sends the email sign-in links |
| `EMAIL_FROM` | `MediCareer Agent <no-reply@hcqsai.uk>` |

`ADMIN_EMAILS` is load-bearing: roles default to `user` and only an admin can grant
admin, so **without it nobody can reach `/admin`, including the owner**. Any listed email
is promoted on register or sign-in. It never demotes, so removing an entry does not lock
someone out mid-session.

Migrations `0001` and `0002` have been applied. Both are additive; `0001` adds a unique
index on `users.email`, so duplicate emails would have to be cleared before it can run on
any other database.

---

## Still to do

**Rotate the Resend API key.** A key named `agent` was pasted into a chat transcript on
20 July and should be treated as exposed. Create a replacement at resend.com (sending
access only), set it as `RESEND_API_KEY` in Manus, and only then delete `agent` — deleting
it first would stop sign-in emails.

**Move the Apply form and Dashboard onto the applications API.** They still read and write
`localStorage`, so a doctor's submitted application never reaches the business. The API
they need exists and is tested; the missing piece is file upload to object storage. This
is the largest remaining gap between "the site works" and "the service works".

**Consider a real photograph of the team** for the "Who is behind this" section. It has no
image by design — see the comment in `Home.tsx`.

---

## Domain

`agent.hcqsai.uk` -> CNAME -> `cname.manus.space`, registered as a custom domain in
Manus. Live and serving over HTTPS. It replaces `agent.tmla.com.sa`; keep the old one
redirecting rather than deleting it, in case the link was shared anywhere.

Nothing in the application hardcodes a domain — sign-in links are built from whatever
host the doctor actually visited, so both domains work without a code change.

---

## What is and is not server-backed

| Area | State |
|---|---|
| Registration, login, sessions, roles | server |
| Email sign-in links | server, tested |
| Applications / documents / messages **API** | server, tested |
| Apply form and Dashboard **UI** | still browser localStorage |
| Admin tools (jobs, queue, follow-up) | still browser localStorage |

The frontend migration stopped at auth deliberately: moving the Apply form and Dashboard
across also means building file upload to object storage, and none of it can be verified
without a database or storage credentials. Writing a large untested migration of the main
conversion funnel was the worse option. The API it needs already exists and is tested.

---

## How tied is this to Manus?

Less than it looks. `server/_core` holds 19 platform files, but only **one** is used by
application code:

| Module | Used? |
|---|---|
| `llm.ts` (AI job-screenshot extraction) | yes, by `routers.ts` |
| `storageProxy`, `imageGeneration`, `voiceTranscription`, `map`, `notification`, `dataApi`, `heartbeat`, `sdk` | no — dead code from the template |

Real lock-in is three things: hosting, the database, and the LLM proxy behind that one AI
feature. All three have standard replacements — the app is plain Node + React + Vite +
tRPC + Drizzle/MySQL. The auth added here talks only to your own database. Domain, email
(Resend) and now the code (GitHub) are all owned directly.

Estimated cost of leaving: a day or two, not a rewrite. No need to decide now — keeping
the code synced to GitHub is what preserves the option.

---

## Running it locally

This machine has no system Node; use the portable copy:

```powershell
$n='C:\Users\cqips_cqi\Desktop\New folder\tools\node-v22.18.0-win-x64'
$env:Path="$n;$env:Path"; $env:COREPACK_ENABLE_DOWNLOAD_PROMPT='0'
& "$n\node.exe" "$n\node_modules\corepack\dist\corepack.js" pnpm install
```

Then from Git Bash:

```bash
NODE_ENV=development JWT_SECRET=local-dev-secret \
  node node_modules/tsx/dist/cli.mjs server/_core/index.ts
```

Without `DATABASE_URL`, sign-in correctly reports "Database is not configured" rather
than failing silently.
