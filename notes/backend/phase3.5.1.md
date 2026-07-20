🚀 Phase 3.5 — Login Implementation (Part 1)
Today's Goal

Today we'll build only these things:

✅ Login Validation
✅ Token Service
✅ JWT Utilities
✅ Environment Variables

We are NOT writing the login controller or service yet.

Why?

Because I want you to understand JWT first.

A common beginner mistake is to call jwt.sign() directly inside the controller. It works, but it mixes authentication logic with request handling.

We want a cleaner architecture.

🏗️ First Question

Where should JWT generation live?

Option 1:

auth.controller.js

Option 2:

auth.service.js

Option 3:

token.service.js

Which one?

Answer

👉 token.service.js

Why?

Because generating tokens is a separate responsibility.

Imagine tomorrow you need to generate a token for:

Login
Refresh
Forgot Password
Email Verification
Magic Link Login

Should every controller know how to create JWTs?

No.

We'll centralize that logic.

Project Structure

Our auth module now becomes:

auth
│
├── auth.controller.js
├── auth.routes.js
├── auth.service.js
├── auth.validation.js
├── token.service.js ⭐ NEW
├── user.mapper.js
├── user.model.js
Step 1 — Environment Variables

Update your .env

JWT_ACCESS_SECRET=your-super-long-random-secret
JWT_REFRESH_SECRET=another-super-long-random-secret

ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
❓Why Two Secrets?

Good question.

Many tutorials use:

JWT_SECRET=abc123

Everything uses the same secret.

I don't like that.

Instead:

Access Token

↓

Secret A
Refresh Token

↓

Secret B

Now imagine Secret A is compromised.

Refresh Tokens are still protected.

This is called separation of secrets.

Attacker's Mindset

Never do:

JWT_SECRET=123456

Use a long random string.

Example:

c93K#xA!9@P...

We can generate one later.

Step 2 — JWT Utility

Create:

src/utils/jwt.js
import jwt from "jsonwebtoken";

export const signToken = ({
payload,
secret,
expiresIn,
}) => {
return jwt.sign(payload, secret, {
expiresIn,
});
};

export const verifyToken = ({
token,
secret,
}) => {
return jwt.verify(token, secret);
};
❓Why Create This Utility?

Instead of writing:

jwt.sign(...)

inside 20 files,

everything goes through one place.

If tomorrow you change libraries or add common options, you update one file.

Step 3 — Token Service

Create:

auth/token.service.js
import { signToken } from "../../utils/jwt.js";

export const generateAccessToken = (user) => {
return signToken({
payload: {
sub: user.\_id.toString(),
role: user.role,
},
secret: process.env.JWT_ACCESS_SECRET,
expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
});
};

export const generateRefreshToken = (user) => {
return signToken({
payload: {
sub: user.\_id.toString(),
},
secret: process.env.JWT_REFRESH_SECRET,
expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
});
};
Why Different Payloads?

Notice something.

Access Token
{
"sub":"123",
"role":"user"
}
Refresh Token
{
"sub":"123"
}

Question:

Why not include the role?

Because the Refresh Token is not used for authorization.

Its only purpose is:

Give me a new Access Token.

Nothing more.

Keep it minimal.

Step 4 — Login Validation

Update:

auth.validation.js
export const loginSchema = z.object({
email: z
.string()
.email()
.trim()
.toLowerCase(),

password: z
.string()
.min(8)
.max(20),
});

Notice:

Same validation.

Different purpose.

Should Signup and Login Share One Schema?

Many beginners think:

Same fields → same schema.

Not always.

Imagine later:

Signup requires:

Name

Email

Password

Confirm Password

Login requires:

Email

Password

Different responsibilities.

Separate schemas.

Security Discussion
Why Don't We Put isAdmin in JWT?

Because:

Admin

↓

Role

↓

Already exists

isAdmin duplicates information.

Keep claims meaningful and minimal.

Why Put Role in Access Token?

Imagine every request:

GET /admin/users

Without role in the token:

JWT

↓

MongoDB

↓

Read User

↓

Check Role

Every request hits the database.

With the role claim:

JWT

↓

Verify Signature

↓

Check Role

Much faster.

However, remember an important trade-off:

If a user's role changes while their Access Token is still valid, the old token still contains the previous role until it expires.

That's one reason we keep Access Tokens short-lived.

📚 Backend Handbook Notes
JWT Utility

Purpose:

One place for:

Sign
Verify
Token Service

Purpose:

Create application-specific tokens.

Access Token

Contains:

sub
role
Refresh Token

Contains:

sub

Only used to obtain a new Access Token.

Security Principle

Use different secrets for different token types.

🎯 Interview Questions
Why create a JWT utility?
Why create a token service?
Why use two JWT secrets?
Why doesn't the Refresh Token contain the role?
Why keep JWT payloads small?
Why is the role included in the Access Token?
What happens if a user's role changes after the Access Token is issued?
📝 Homework

Implement:

jwt.js
token.service.js
loginSchema

Then think about this scenario:

A user logs in as an admin. Five minutes later, a super admin changes their role to "user". Their Access Token is still valid for another ten minutes.

Question: Should they still be able to access admin APIs during those ten minutes?

There isn't a single perfect answer. The decision depends on your security requirements.

Think about the trade-offs before our next lesson.

📚 Backend Handbook Notes
Login Flow

Client

↓

POST /login

↓

Validation

↓

Find User (+password)

↓

Compare Password

↓

Generate Access Token

↓

Generate Refresh Token

↓

Hash Refresh Token

↓

Store Hash in MongoDB

↓

Set Access Token Cookie

↓

Set Refresh Token Cookie

↓

Return User DTO
