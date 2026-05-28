# Second Life Log Q&A Design

## Summary

Build a logged-in SvelteKit feature where a user uploads one Second Life chat log, keeps the raw log session-only, and asks an AI model questions about it. The first version prioritizes privacy, low operating cost, and a small implementation surface.

The app will clearly state that raw uploaded logs are not stored by this app and are only used for the active session. It will also state that the feature uses the paid Gemini API tier configured for this project, based on provider policy that submitted content is not used to improve Google products.

## Goals

- Let users drag and drop or manually upload one Second Life `.txt` or `.log` file.
- Show common Second Life log folder paths as upload guidance instead of trying to force the OS file picker to open a local folder.
- Let authenticated users ask questions about the uploaded log.
- Return answers grounded in the log, with short evidence snippets or line references when possible.
- Keep raw log contents out of persistent storage.
- Limit paid AI usage to 20 questions per signed-in user per UTC day.

## Non-Goals

- No multi-log upload or cross-log search in v1.
- No persistent log library, saved log workspace, or saved raw transcript history.
- No desktop helper or native file picker integration.
- No large-log chunking or retrieval pipeline in v1.

## User Experience

The Log Q&A page contains two primary areas:

1. Upload area: drag/drop zone, file picker, accepted file guidance, maximum size copy, loaded file metadata, and common Second Life log path hints.
2. Q&A area: question input, submit button, answer history for the current page session, and answer evidence.

Privacy copy must be prominent near the upload control:

- "Your raw log is used only for this active session and is not stored by this app."
- "Questions are answered using the paid Gemini API tier configured for this project; provider policy says submitted content is not used to improve Google products."

If a user is not signed in, the page can still explain the feature and allow file selection, but asking the AI question must return a clear sign-in requirement.

## Architecture

The browser reads the uploaded file as text using the File API. The raw log text remains in client/session state and is sent to the server only when the user asks a question. The server does not store the raw log.

A SvelteKit JSON endpoint receives:

- `fileName`
- `logText`
- `question`

The endpoint validates authentication, file shape, log size, and question text. It then increments the user's daily AI usage counter in D1. If the user is within quota, it sends line-numbered log text and the question to Gemini 2.5 Flash-Lite through a server-only provider wrapper.

The provider returns a structured answer:

- `answer`: short direct response
- `evidence`: list of short supporting snippets or line references

The Gemini provider is hidden behind a small interface so another model can replace it later without changing route/UI behavior.

## Data Storage

Only daily usage counters are persisted.

The D1 usage record tracks:

- user id
- UTC day string
- question count
- update timestamp

Raw logs, uploaded file names, full questions, and full answers are not persisted in v1.

## Validation And Errors

The app rejects:

- Empty files.
- Unsupported extensions other than `.txt` and `.log`.
- Files above the configured v1 size limit.
- Empty questions.
- Unauthenticated AI requests.
- Requests beyond 20 questions per user per UTC day.

Errors should be direct and non-leaky. Gemini/API failures should not expose provider stack traces, API keys, or raw provider payloads.

## AI Prompting

The server prompt instructs the model to answer only from the supplied Second Life log. If the answer is not supported by the log, the model must say it cannot tell from the log.

The prompt requests JSON output with:

- a direct answer
- evidence snippets or line references

The server should line-number the uploaded log before sending it to the provider to make evidence easier to cite.

## Testing

Automated coverage should include:

- File validation accepts normal `.txt` and `.log` files.
- File validation rejects empty, oversized, and unsupported files.
- Unauthenticated requests cannot ask AI questions.
- The 21st question in one UTC day is blocked for the same user.
- Prompt construction includes the question, line-numbered log content, and evidence instructions.
- Gemini/provider failure returns a clear user-facing error.
- The page contains session-only and paid Gemini provider-policy privacy copy.

Manual acceptance should verify:

- A signed-in user can upload a normal Second Life log.
- A valid question returns an answer and evidence.
- Raw log data is not inserted into any app database table.
- The visible upload guidance includes common Second Life log folder paths.

## Decisions

- V1 approach: direct session Q&A.
- Storage: session-only raw logs; no raw log persistence.
- Folder handling: browser-safe path hints, not forced default folder opening.
- AI provider: paid Gemini API with Gemini 2.5 Flash-Lite as the cost-efficient default.
- Access control: require Better Auth login to ask questions.
- Rate limit: 20 AI questions per signed-in user per UTC day.
- Answer style: grounded answers with evidence snippets or line references.
