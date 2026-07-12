Senior Note #1

Express itself doesn't make your application secure.

Express is just a routing framework.

Everything else (Helmet, JWT, Validation, Rate Limiting, CORS, Secure Cookies, etc.) is your responsibility.

Never think:

"I'm using Express, so it's secure."

No.

Express is intentionally minimal.

=================================================

Senior Note #2 — Fail Fast

Never run your backend when:

Database isn't connected
Required environment variables are missing
Payment secret isn't loaded

It's better to crash immediately than fail randomly later.

=================================================

Senior Note #3

Node can receive many signals:

SIGINT

SIGTERM

SIGQUIT

Later, when we deploy, we'll also handle SIGTERM because hosting platforms send that signal when stopping your app.

=================================================

Senior Note #4 — DRY

This follows the DRY principle:

Don't Repeat Yourself.

If you copy the same try...catch into 30 controllers, that's a sign you should abstract it.

========================================================

Senior Note #5 — Middleware Order (Again!)

Express executes middleware top to bottom.

That's why:

Security middleware comes first.
Routes come next.
404 handler after routes.
Error handler always last.

If the error handler isn't last, errors can bypass it.
