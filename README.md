This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication

Create a project on `Neon.com`

Save DATABASE_URL to `.env` file

### Database

Install

```
npm i drizzle-orm @neondatabase/serverless dotenv
npm i -D drizzle-kit drizzle-seed
```

Create `drizzle.config.ts` file

Add drizzle schema to `src/db/schema.ts`

Run `npm run db:generate` to generate migration files

Run `npm run db:migrate` to create tables

Add seed script to `src/db/seed.ts`

Add drizzle scripts to `package.json`

Seed the database by running `npm run db:seed`

## Object Storage and Key-Value Storage

### Image Storage

Create a project on `vercel.com`

Create a blob storage and get the `BLOB_BASE_URL` environment variable

Add `BLOB_BASE_URL` to `.env` file

Install `@vercel/blob` package

### Key-Value Storage

To cache results and reduce load on the database. Instead of running expensive SQL queries every time a page loads, results can be cached in Redis which is better suited to handle high traffic volumes. This is particularly useful for expensive queries with joins or data that doesn't change frequently.

`Memcached` only lives in memory and doesn't write anything to disk, meaning all data is lost when the node shuts down. Redis, on the other hand, flushes data to disk, so if Redis goes down and needs to be brought back up, the data is still available. This makes Memcached extremely fast but without persistence, while Redis offers a balance of speed and data durability.

`Valkey` is essentially a re-implementation of `Redis` that emerged when Redis put restrictive terms on how people could use it. The open source community responded by creating Valkey as a more open source alternative. Valkey and Redis are approximately 99% the same, with the main difference being that Valkey is more open source while Redis is backed by a full company.

**Server-side caching** with Redis is primarily used to save server load and reduce expensive operations on databases or services. Client-side caching with tools like React Query is primarily used to reduce latency by avoiding round trips to the server, making data immediately available to the user. While both reduce API hits, they serve different primary purposes: Redis focuses on reducing server/database load, while React Query focuses on improving user experience through faster data access.

Redis is ideal for:

1. Caching expensive query results to avoid repeatedly hitting the database with the same queries
2. Storing intermediary results from expensive computations or machine learning pipelines
3. Tracking non-critical data like page views where data loss wouldn't be catastrophic

Redis is particularly useful for data that is accessed frequently but doesn't require the full durability guarantees of a traditional database.

On `upstash.com` create a database and get the `UPSTASH_URL` and `UPSTASH_TOKEN` environment variables

Install `upstash/redis` package - `npm i @upstash/redis`

Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables

Add cache set/get/del logic to the application

Connect `upstash` project to `vercel` project

## Transactional Emails

Login on `resend.com` and create an API Key

Install `resend` and `@react-email/render` packages

Create a logic to send emails to users when their articles get a certain number of views

Create an email template using `react-email`

## AI Integration

Install `ai` package - `npm i ai`

For using Anthropic models install `npm i @ai-sdk/anthropic`

Add AI summary to articles

Add summary field to API requests

Migrate database - `npm run db:generate` and `npm run db:migrate`

## Deployment & CI/CD

## Analytics

Install `@vercel/analytics` package

Add `<Analytics />` component to `src/app/layout.tsx`
