# Accra Christmas Village PWA

V1 web application for Accra Christmas Village: public visitor guide, participant portal and organizer admin workspace.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Neon Serverless PostgreSQL
- Drizzle ORM and Drizzle Kit
- Netlify deployment with `@netlify/plugin-nextjs`
- GitHub Actions CI using pnpm

## Setup

1. Clone the repo.
2. Install dependencies:

```bash
pnpm install
```

3. Create a Neon database.
4. Set `DATABASE_URL` in `.env.local`:

```env
DATABASE_URL=postgres://...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

5. Generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

6. Seed the database:

```bash
pnpm db:seed
```

7. Run the dev server:

```bash
pnpm dev
```

8. Deploy to Netlify. Connect the GitHub repo, add `DATABASE_URL`, and let Netlify run `pnpm build` using `netlify.toml`.

## Demo Access

The app includes a demo role switcher in the header for visitor, vendor, sponsor and admin previews. Authentication is isolated in `src/lib/auth.ts` so it can be replaced with a real provider later.

## Document Uploads

V1 uses a storage abstraction in `src/lib/storage.ts`. The local mock upload flow stores document metadata through Drizzle when `DATABASE_URL` is configured and returns a `local://` mock object URL for UI testing.

TODO: replace the mock storage adapter with Netlify Blobs, S3 or Cloudflare R2 before production document handling.

## Useful Scripts

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```
