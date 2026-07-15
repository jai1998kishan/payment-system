🚀 Phase 3.4 — Login System (Architecture First)

Important: Today we're not writing the complete login API.

We're first going to design it. Once you understand the design, the code becomes much easier.

🎯 Learning Goals

By the end of this lesson you'll understand:

How login works internally
Why login is more sensitive than signup
JWT structure
Access Token vs Refresh Token
Cookie strategy
Why we hash refresh tokens
Common login attacks
How professionals design login systems
🤔 First Question

When the user clicks:

Login

What actually happens?

Most beginners think:

Email

↓

Password

↓

JWT

↓

Done

That's only about 20% of the story.

Let's Design the Complete Flow
Client

↓

POST /auth/login

↓

Rate Limiter

↓

Validation

↓

Controller

↓

Service

↓

Find User

↓

Compare Password

↓

Generate Access Token

↓

Generate Refresh Token

↓

Hash Refresh Token

↓

Save Hash in Database

↓

Set Cookies

↓

Return Safe User DTO

This is the flow we're going to build.

Why Is Login Harder Than Signup?

Signup only creates a user.

Login gives access to protected resources.

Imagine someone breaks login.

They now have access to:

Payments
Complaints
Orders
Admin Panel (if authorized)
Personal Information

So login deserves extra protection.

Let's Break Login Into Small Pieces

Instead of writing 150 lines at once, we'll build it in stages.

Step 1 — Validate Request

Expected body:

{
"email": "rocky@gmail.com",
"password": "Password@123"
}

Question:

Should this reach MongoDB?

If email is:

abc

No.

Validation rejects it immediately.

Step 2 — Find User

Service:

const user = await User.findOne({ email }).select("+password");
🤔 Wait...

Why .select("+password")?

Remember our model?

password: {
select: false
}

That means password is hidden by default.

During login, we explicitly request it.

This is one of the biggest reasons we used select: false earlier.

Everything is connected.

Think Like a Senior

Question:

What if the email doesn't exist?

Bad response:

{
"message":"Email not found"
}

Good response:

{
"message":"Invalid email or password"
}

Why?

🛡 Attacker's Mindset #1

Imagine I'm an attacker.

I try:

admin@gmail.com

Response:

Email not found

Great.

Now I know that email isn't registered.

Next:

ceo@company.com

Response:

Wrong password

Now I know the CEO's email exists.

This is called User Enumeration.

Professional Solution

Always return:

Invalid email or password.

Never reveal which one was wrong.

Step 3 — Compare Password

We'll use the method we created earlier:

const isPasswordValid = await user.comparePassword(password);

Question:

Why did we create comparePassword() inside the model?

Instead of:

bcrypt.compare(...)

inside every controller.

Answer:

Because the User knows how to verify its own password.

This follows the Object-Oriented Principle of Encapsulation.

The behavior belongs with the data.

Step 4 — Generate Tokens

Now comes JWT.

But before writing code...

Let's understand JWT.

JWT Structure

A JWT looks like this:

xxxxx.yyyyy.zzzzz

Three parts.

Header
{
"alg":"HS256",
"typ":"JWT"
}

Tells the algorithm.

Payload
{
"id":"123",
"role":"user"
}

Contains claims.

Notice something.

There is NO PASSWORD.

Never put passwords in JWTs.

Signature

The backend signs:

Header

-

Payload

-

Secret Key

↓

Signature

This prevents tampering.

Attacker's Mindset #2

Suppose I decode:

{
"role":"user"
}

and change it to:

{
"role":"admin"
}

Can I become admin?

No.

Because when the backend verifies the JWT, the signature won't match anymore.

The token becomes invalid.

What Should We Store Inside JWT?

Many beginners put:

{
"name":"Rocky",
"email":"...",
"phone":"...",
"address":"...",
"age":22
}

Don't.

JWT is not your user profile.

We'll keep it minimal.

Our Access Token payload will look like:

{
"sub":"userId",
"role":"user"
}
Why sub?

sub means Subject.

It's a standard JWT claim representing the identity of the token owner.

Using standard claims makes your tokens easier to understand and integrate with other systems.

Design Decision

Question:

Should we include the email?

We could.

But do we need it for authorization?

No.

The backend can fetch the user by ID when needed.

Keep tokens small.

📚 Backend Handbook Notes (Phase 3.4)
Login Flow
Validate

↓

Find User

↓

Compare Password

↓

Generate Tokens

↓

Store Refresh Token Hash

↓

Set Cookies

↓

Return User DTO
Security Principles
Never reveal whether email exists.
Passwords stay hidden by default.
Explicitly select the password only during login.
JWT payload should contain only necessary claims.
Never include passwords or sensitive personal data in a JWT.
Design Decisions

Why .select("+password")?

Because password is hidden by default using select: false.

Only login needs access to it.

Why Use sub Instead of userId?

It follows the JWT specification and clearly identifies the token subject.

🎯 Interview Questions
Why is password marked with select: false?
Why do we use .select("+password") during login?
What is user enumeration?
Why should login return a generic error?
What are the three parts of a JWT?
What should and shouldn't be stored inside a JWT?
What does the sub claim represent?
📝 Homework (No Code Yet)

Before we write any login code, answer these without looking back:

Why do we use .select("+password")?
Why shouldn't we say "Email not found"?
Why doesn't changing "role":"user" to "role":"admin" work in a JWT?
Why should the JWT payload stay small?
What is the purpose of the sub claim?
⭐ One Improvement Before We Write Code

Now that you understand the architecture, the next lesson will be implementation only.

We'll write:

loginSchema
loginService
loginController
token.service.js
jwt.utils.js (or a similar utility)

But here's the difference from signup:

Before writing each function, I'll first ask:

"What problem is this function solving?"

Only after you're clear on the purpose will we write the code.

That's how you'll learn to design software instead of just assembling pieces of code. 💪
