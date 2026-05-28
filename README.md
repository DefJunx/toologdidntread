# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@0.15.3 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:typography,forms" drizzle="database:d1" better-auth="demo:password" mcp="ide:claude-code,cursor,opencode,other+setup:remote" --install pnpm toologdidntread
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Log Q&A

- Route: `/log-qa`
- Raw log text is session-only and never stored by this app.
- Requires `GEMINI_API_KEY` and Better Auth login for AI questions.
- Unauthenticated visits to `/log-qa` are redirected to `/login?next=/log-qa`.
- New account creation is invite-only via `/register` and a valid invite code.
