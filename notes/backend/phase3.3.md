Phase 3.3 — Authentication Design
Business Requirement

Our application has:

Normal User
Admin

Users can:

Signup
Login
Buy products
Raise complaints
View their own payments

Admins can:

View all users
View all payments
Resolve complaints
Manage products

So authentication isn't just "login".

It's the foundation for everything.

First Question
What happens when the user clicks Login?

Let's think.

User

↓

POST /auth/login

↓

Rate Limiter

↓

Validate Request

↓

Find User

↓

Compare Password

↓

Generate Access Token

↓

Generate Refresh Token

↓

Save Refresh Token

↓

Set Secure Cookies

↓

Return Safe User DTO

Notice...

The frontend never generates tokens.

Everything happens on the backend.

Why?
Attacker's Mindset

Imagine the frontend generates JWTs.

An attacker opens DevTools.

const token = {
role:"admin"
}

Game over.

Only the backend should create trusted tokens.

Second Question
Why Two Tokens?

Most tutorials say:

Access Token + Refresh Token

But they never explain why.

Imagine only one token.

Valid for 30 days

If stolen:

Attacker has 30 days.

Bad.

Now imagine:

Access Token

15 minutes

If stolen:

Attacker only gets 15 minutes.

Much better.

Then how does the user stay logged in?

Refresh Token.

Token Architecture
Login

↓

Access Token (15 min)

↓

Refresh Token (7 days)

↓

Cookies

When Access Token expires:

Frontend

↓

/refresh-token

↓

Backend checks Refresh Token

↓

Issues New Access Token

User never notices.

Why Not Make Access Token 7 Days?

Because security and convenience fight each other.

Long Expiry Short Expiry
Better UX Better Security
More Risk Less Risk

Good systems balance both.

Third Question
Where Should Tokens Be Stored?

There are four common choices.

localStorage

Pros:

Easy.

Cons:

JavaScript can read it.

If XSS happens:

localStorage

↓

JWT Stolen
sessionStorage

Same issue.

Memory

Safer.

But page refresh loses authentication.

HttpOnly Cookie ✅

JavaScript cannot read it.

Browser automatically sends it.

This is why we'll use cookies.

Cookie Design

Our cookie will look like:

HttpOnly ✅

Secure ✅

SameSite=Lax (or Strict depending on deployment)

Max-Age

Path

We'll discuss every option later.

Should We Store Refresh Token in Database?

Many tutorials don't.

I disagree.

Imagine:

User logs out.

If refresh token isn't stored,

How do you invalidate it?

You can't.

Instead:

Database

↓

Refresh Token

↓

Logout

↓

Delete Token

↓

Cannot Refresh

Now logout actually works.

But Wait...

Should we store the refresh token as plain text?

No.

Attacker's Mindset

Imagine MongoDB leaks.

If refresh tokens are plain text:

Attacker can immediately use them.

Instead:

Refresh Token

↓

Hash

↓

Store Hash

Exactly like passwords.

Even if the DB leaks, usable tokens aren't exposed.

Authentication Architecture
Browser

↓

Login

↓

Backend

↓

Access Token Cookie

↓

Refresh Token Cookie

↓

Database (Hashed Refresh Token)

↓

Protected APIs

This is very close to what many production systems do.

Login Security

Let's think like an attacker.

Attack 1

Brute Force.

admin@gmail.com

↓

123456

↓

123457

↓

123458

Defense:

Login rate limiter.

Attack 2

Email Enumeration.

Bad API:

Email not found

Good.

Attacker now knows the email doesn't exist.

Bad.

Instead:

Invalid email or password.

Same message.

No information leaked.

Attack 3

Timing Attack.

If email doesn't exist:

Response:

10 ms

Password wrong:

150 ms

Attacker learns valid emails.

We'll discuss mitigation later.

Attack 4

JWT Tampering.

Attacker changes:

{
"role":"admin"
}

Defense:

JWT Signature.

Backend verifies signature before trusting claims.

Attack 5

Cookie Theft.

Defense:

HttpOnly

Secure

SameSite

Short access token lifetime

Should We Return the Token in JSON?

No.

Many tutorials do:

{
"accessToken":"..."
}

We're not doing that.

Instead:

Set-Cookie

↓

HttpOnly

↓

Browser Stores

↓

Frontend Never Reads It

Much safer.

Our Final Authentication Flow
Signup

↓

Login

↓

Validate

↓

Generate Tokens

↓

Hash Refresh Token

↓

Store Hash

↓

Set Cookies

↓

Return User DTO

Notice:

No passwords.

No tokens in JSON.

Only safe data.

Senior Design Decision

You asked me:

"How should I make it more professional and secure?"

Here's one thing I want us to add.

Instead of this:

auth.service.js

growing to 600 lines,

we'll split responsibilities.

auth
│
├── auth.controller.js
├── auth.service.js
├── auth.routes.js
├── auth.validation.js
├── user.model.js
├── user.mapper.js
├── token.service.js
├── password.service.js
└── auth.utils.js

Why?

Because authentication actually has multiple responsibilities:

Password handling
Token handling
Business logic
Validation

Keeping them separate makes the code easier to test and maintain.

📚 Backend Handbook Notes (Phase 3.3)
Authentication Flow
Login

↓

Validation

↓

Find User

↓

Compare Password

↓

Generate Tokens

↓

Store Refresh Token

↓

Set Cookies

↓

Return User DTO
Security Principles
Backend generates tokens.
Never trust the client.
Store refresh tokens hashed.
Use HttpOnly cookies.
Return generic login errors.
Keep access tokens short-lived.
Design Decisions

Why Access + Refresh Tokens?

Security + user experience.

Why HttpOnly Cookies?

Protect against JavaScript access in XSS attacks.

Why Hash Refresh Tokens?

Reduce impact if the database is compromised.

🎯 Interview Questions
Why do we use Access Tokens and Refresh Tokens instead of one long-lived token?
Why shouldn't JWTs be stored in localStorage?
Why should refresh tokens be hashed in the database?
Why return "Invalid email or password" instead of "Email not found"?
Why should the backend generate JWTs?
📝 Homework (No Code Today)

Before writing a single line of login code, I want you to answer these questions in your own words:

Why do we need two tokens?
Why don't we store JWTs in localStorage?
Why are refresh tokens stored hashed?
Why should login return a generic error message?
Draw the authentication flow on paper from memory.

If you can explain these concepts without code, then the implementation becomes much easier.

⭐ A Small Improvement to Our Course

From the next lesson onward, we're going to introduce Threat Modeling.

For every major feature, we'll create a small table like this:

Asset Threat Defense
Password Database leak bcrypt hashing
Access Token Token theft Short expiry + HttpOnly cookie
Refresh Token Database leak Hash before storing
Login API Brute force Rate limiter
User Account Email enumeration Generic error messages

This is a simplified version of how many security-focused teams think about application design. It helps you connect every security decision to the specific problem it's meant to solve.
