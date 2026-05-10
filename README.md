# Mini Twitter

Mini Twitter is a small full-stack social media app built with Next.js,
TypeScript, Prisma, and SQLite. Users can create an account, log in, publish
tweets, like posts, edit their own tweets, delete their own tweets, and view
tweet details.

## Features

- User registration, login, and logout
- Password hashing for stored user passwords
- Auth-aware home page and navigation
- Tweet list page with topic filters
- Create, read, update, and delete tweets
- Dedicated tweet details page
- Protected edit and delete actions for tweet owners
- Like and unlike system
- Follow and unfollow other users
- User profile page with personal tweet statistics
- Tweet title, topic, mood, content, timestamps, and like count
- Form validation with user-friendly error messages

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Prisma ORM
- SQLite
- Tailwind CSS

## Project Structure

```text
app/                  Next.js routes and pages
components/           Shared UI components
lib/auth/             Session and password helpers
lib/prisma.ts         Prisma client setup
prisma/schema.prisma  Database models
prisma/migrations/    Prisma migration history
```

## Database Models

The app uses three main Prisma models:

- `User` stores account data, username, email, hashed password, and created date.
- `Post` stores tweet title, content, topic, mood, timestamps, and owner.
- `Like` stores which user liked which tweet.
- `Follow` stores follower and following relationships between users.

## Routes

| Route | Description |
| --- | --- |
| `/` | Home page |
| `/register` | Create a new account |
| `/login` | Log in to an existing account |
| `/logout` | Log out |
| `/tweets` | View tweets and filter by topic |
| `/tweets/new` | Create a new tweet |
| `/tweets/[id]` | View tweet details |
| `/tweets/[id]/edit` | Edit a tweet owned by the current user |
| `/profile` | View current user profile and personal tweets |
| `/users/[id]` | View another user's profile and follow or unfollow them |

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
```

Apply database migrations and generate the Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

Open the app in the browser:

```text
http://localhost:3000
```

## Useful Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Screenshots

Screenshots should be added before submission to show the main user flow:

- Home page
- Register page
- Login page
- Tweets page
- New tweet page
- Tweet details page
- Edit tweet page
- Profile page

## Notes

Only logged-in users can create tweets, like tweets, edit their own tweets, and
delete their own tweets. Logged-in users can also follow or unfollow other users.
Guests can still view the public tweet list, tweet details, and public profiles.
