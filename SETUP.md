# Setup Guide

Step-by-step guide to get AuthKit running from scratch.

---

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free tier works)
- A [Resend](https://resend.com) account (optional — omit for demo mode)
- A [Upstash](https://upstash.com) account (optional — omit to disable rate limiting)

---

## 1. Clone and install

```bash
git clone https://github.com/your-username/authkit.git
cd authkit
npm install
```

---

## 2. Environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values. See comments in the file for where to get each one.

**Minimum required to run locally:**

```env
DATABASE_URL="..."
DATABASE_URL_UNPOOLED="..."
AUTH_SECRET="..."          # openssl rand -base64 32
AUTH_URL="http://localhost:3000"
```

Everything else is optional — OAuth providers, Resend, and Upstash can be added later.

---

## 3. Database setup

Push the schema to your database:

```bash
npx prisma db push
```

Create the initial admin user:

```bash
npx prisma db seed
```

> The seed reads `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_NAME` from `.env` (not `.env.local`).
> Add those values to your `.env` file before running the seed.

---

## 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 5. Configure OAuth providers (optional)

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → OAuth 2.0 Client ID
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App → Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and Secret to `.env.local`

### Discord

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. New Application → OAuth2 → Add redirect: `http://localhost:3000/api/auth/callback/discord`
3. Copy Client ID and Secret to `.env.local`

---

## 6. Configure email (optional)

Without a Resend API key, the app runs in **demo mode**:
- Registration auto-verifies emails — no email needed
- Password reset is disabled — use OAuth or reset via Prisma Studio

To enable emails:
1. Create an account at [Resend](https://resend.com)
2. Get your API key
3. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in `.env.local`

---

## 7. Configure rate limiting (optional)

Without Upstash, login rate limiting is disabled.

To enable:
1. Create a Redis database at [Upstash](https://console.upstash.com)
2. Copy the REST URL and token to `.env.local`

---

## 8. Deploy to Vercel

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Update `AUTH_URL` to your production URL (e.g. `https://authkit.vercel.app`)
5. Update OAuth redirect URIs in each provider's dashboard to use the production URL
6. Deploy

> Vercel provides geo headers automatically — IP-based geolocation works out of the box.

---

## Prisma tips

```bash
npx prisma studio          # GUI to view/edit database
npx prisma db push         # sync schema changes to database
npx prisma db seed         # create initial admin user
npx prisma generate        # regenerate the Prisma client after schema changes
```

---

## Project structure

```
src/
├── app/
│   ├── (auth)/            # Login, register, verify-email, reset-password, 2FA
│   ├── (protected)/       # Dashboard, profile, sessions, admin, onboarding
│   ├── api/               # Route handlers (NextAuth, CSV export)
│   ├── docs/              # Interactive documentation page
│   └── page.tsx           # Landing page
├── actions/               # Server Actions (auth, sessions, 2FA, impersonation)
├── components/
│   ├── auth/              # Form components for all auth flows
│   ├── admin/             # Admin panel components
│   ├── profile/           # Profile page components
│   ├── nav/               # Navbar
│   └── ui/                # shadcn/ui primitives
├── lib/                   # Utilities (db, mail, tokens, audit, rate-limit, 2FA)
└── auth.ts                # NextAuth v5 configuration
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Admin user seed script
```
