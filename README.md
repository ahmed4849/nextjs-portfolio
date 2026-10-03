# Deploy Muhammad Ahmad's portfolio on Vercel

This is a standalone Next.js project generated from the portfolio's shared application source. It includes the website, `/admin`, and all API routes. Deploy the **portfolio-vercel** folder, not the original Vinext/Cloudflare Workers folder.

## Where each part runs

```text
Visitor's browser
    │ HTTPS, same-origin requests
    ▼
Vercel: Next.js website + /api/contact + /api/session + /api/admin
    │ Server-only authenticated HTTPS calls with parameterized SQL
    ▼
Cloudflare: your persistent D1 database
```

Vercel executes the backend as functions. Your database remains on Cloudflare, independent of function restarts or website redeployments. No database file is stored on Vercel's temporary filesystem. D1 uses SQLite SQL semantics; it is a managed remote database in this setup.

The current `chatgpt.site` publication has a managed D1 database in the Sites environment. A Vercel deployment needs a D1 database in **your own Cloudflare account** and your own API token. This package does not contain credentials for the managed database. The two deployments do not automatically share or synchronize their data.

## 1. Create your database

Install Node.js 22.13 or newer, then in the extracted `portfolio-vercel` folder run:

```sh
npm install
npx wrangler login
npx wrangler d1 create ahmad-portfolio
```

Wrangler prints a database ID. Put that ID into `wrangler.json` in place of `REPLACE_WITH_YOUR_D1_DATABASE_ID`. If you have multiple Cloudflare accounts, set `CLOUDFLARE_ACCOUNT_ID` to the selected account before running Wrangler.

Create the tables and add EStore:

```sh
npx wrangler d1 migrations apply DB --remote --config wrangler.json
```

Apply migrations once when setting up the database and again when a future release adds a migration. Wrangler records applied migrations. Applying existing migrations again does not reset saved content. Do not delete or recreate the production database during ordinary deployments.

## 2. Create a Cloudflare API token

In Cloudflare, open **My Profile → API Tokens → Create Token → Custom Token**. Grant the selected account **D1 Edit** permission so the backend can read and write its database. Restrict the token to your selected account. Use a token, not your global API key.

Get your account ID from the Cloudflare dashboard and your database ID from D1 or the create command. Keep the token private. API tokens and the admin key are server-only values; never add a `NEXT_PUBLIC_` prefix or commit their values.

## 3. Import into Vercel

1. Put the extracted `portfolio-vercel` source in your own Git repository. Include `package-lock.json`, `wrangler.json`, and `drizzle/`; exclude `.env*`, `node_modules`, and `.next`.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Select **Next.js**. If the folder is inside a larger repository, set Root Directory to `portfolio-vercel`.
4. Use Node.js 22.x or a supported newer version. Build command is `npm run build`. Leave the output directory at its Next.js default.
5. Add these environment variables to **Production** before deploying:

| Variable | Value |
| --- | --- |
| `ADMIN_KEY` | A new random secret, at least 32 characters |
| `CLOUDFLARE_ACCOUNT_ID` | Your 32-character Cloudflare account ID |
| `CLOUDFLARE_D1_DATABASE_ID` | The database UUID from step 1 |
| `CLOUDFLARE_D1_API_TOKEN` | Your restricted D1 API token |

Generate an admin key locally:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

6. Click **Deploy**. Environment variable changes require a redeployment.
7. Open the assigned Vercel URL, then `/admin`, and sign in with your new admin key. Add your custom domain through Vercel project settings if desired.

Use a separate D1 database and a separate admin key for Vercel Preview deployments if you enable previews. This prevents test submissions and preview edits from changing production data. Set the four variables independently for each environment.

## How the database works

| Table | Stores |
| --- | --- |
| `settings` | Your profile, headline, bio, skills and social links as validated JSON |
| `projects` | Project title, description, category, technologies and URL |
| `messages` | Contact name, email, message, read status and timestamp |
| `rate_limits` | Hashed per-IP counters with expiry, for contact/login throttling |

On the first page request, an uninitialized database gets the profile and project defaults from `lib/content.ts`. Future page requests read your saved content. Defaults do not overwrite your admin edits. The homepage is dynamically rendered, so a reload after saving shows the database values.

When a visitor submits the contact form, `/api/contact` checks the origin, validates the fields, rejects the spam trap, checks the database-backed rate limit, inserts a message and returns success. You view that message in `/admin`. Email notifications are not configured.

Admin login verifies `ADMIN_KEY` and sets a signed HttpOnly session cookie for eight hours. Each admin API request validates that cookie. Profile/project writes use prepared parameters; submitted text is never concatenated into SQL.

The Vercel adapter in `lib/d1-rest.ts` calls Cloudflare's documented D1 query endpoint. A request timeout or failed database query returns an error instead of claiming the data was saved. This setup adds a network request between Vercel and Cloudflare for database operations; high-traffic applications should review database/API limits and latency.

## Local development of this Vercel package

Copy `.env.example` to `.env.local`, fill in the four values using a **development D1 database**, apply its migrations, then run:

```sh
npm run dev
```

Visit `http://localhost:3000`. Local development uses the remote database configured in `.env.local`. It does not use the Sites preview's local `.wrangler` database. Choose a development database so your tests cannot modify your live portfolio.

## Existing data, backups and recovery

The package contains initial profile/project content, not a copy of the current Sites inbox or later admin edits. Reapply those edits through the new admin dashboard, or import a separately obtained data export. Changing the database ID points the app at a different database; it does not migrate data.

Export your own D1 data before a major migration:

```sh
npx wrangler d1 export DB --remote --config wrangler.json --output portfolio-backup.sql
```

Keep backup SQL private because it contains contact emails and messages. D1 also provides Time Travel recovery; check its current retention for your account plan. Do not publish backups in your repository.

## What you can edit

Edit profile and projects in `/admin`. Manage incoming messages there too. Experience, education and certifications currently live in `lib/content.ts`; changing those requires a source edit and deployment.

EStore is listed as **In progress**. Its .NET/Angular/SQL Server stack describes that showcased project. The portfolio's own backend is TypeScript and D1; deploying this portfolio does not deploy the EStore application or its SQL Server database.

## Troubleshooting

- **Build succeeds but the page fails:** check the four Production variables, their selected environment, and whether the D1 migrations were applied. Redeploy after changing variables.
- **Contact form says unavailable:** inspect Vercel function logs, D1 token permissions and the database ID. No message is confirmed until the database insert succeeds.
- **Admin login fails:** use the `ADMIN_KEY` set for this Vercel project, not an old Sites access key.
- **Too many attempts:** contacts allow five submissions per IP per hourly window; login allows ten attempts per fifteen-minute window.
- **Content looks like defaults:** you are probably using a new database. The Sites deployment and your Vercel deployment have separate data unless you explicitly migrate it.

## Official references

- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Cloudflare D1 query API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/)
- [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
- [D1 Wrangler commands and exports](https://developers.cloudflare.com/d1/wrangler-commands/)
- [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- [Vercel request headers](https://vercel.com/docs/headers/request-headers)
