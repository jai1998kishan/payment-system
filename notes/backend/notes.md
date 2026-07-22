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

=====================================================

Senior Note #6

Models should contain behavior related to themselves.

Examples:

Hash password
Compare password
Generate full name (if applicable)
Validate internal state

Controllers shouldn't know how a password is compared.

===================================================

Senior Note #7

Validation is not business logic.

Validation answers:

Is the data correctly shaped?

Business logic answers:

Can this user register?

Different responsibilities.

==================================================
⭐ Senior Note #8

Notice we created errors like this:

const error = new Error("Email already registered");
error.statusCode = 409;
throw error;

This works, but it's not the final design.

In the next lesson, we'll build a proper ApiError class.

Why?

Because we'll soon have many error types:

Validation
Authentication
Authorization
Payment
File upload

A custom error class keeps error handling consistent and avoids repeating statusCode assignments.

We're postponing it until now because I wanted you to first understand the basic error flow.

===================================================

Senior Note #9 — Layers

Let's define our project architecture now.

Route
│
▼
Validation
│
▼
Controller
│
▼
Service
│
▼
Repository (Later)
│
▼
MongoDB

And when data comes back:

MongoDB

↓

Repository

↓

Service

↓

Mapper (DTO)

↓

Controller

↓

Response

We're not introducing a Repository yet because it would be unnecessary complexity at this stage.

We'll add it only if we reach a point where it provides clear value.

==================================================

Senior Rule #11

Sensitive data should be hidden by default.

Never depend on developers remembering not to return it.

Let the schema protect you.

=================================================
