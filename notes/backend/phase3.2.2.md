This is something I would do if I joined your team as a Senior Backend Engineer.

It's a small change now, but it will save us from writing duplicate code throughout the project.

🏗 Phase 3.2.5 — Build Better Before Building More

Most tutorials keep writing this:

return {
id: user.\_id,
name: user.name,
email: user.email,
};

Then in another controller:

return {
id: product.\_id,
title: product.title,
price: product.price,
};

Then:

return {
id: complaint.\_id,
message: complaint.message
}

Eventually you repeat yourself everywhere.

Senior Question 🤔

Suppose tomorrow your User model becomes:

{
name,
email,
password,
refreshToken,
failedLoginAttempts,
lockUntil,
isBlocked,
lastLogin,
role,
profileImage,
createdAt,
updatedAt
}

Should the frontend receive all of this?

No.

So how do big companies solve this?

The Concept: DTO (Data Transfer Object)

This is one of those concepts that many developers hear only after joining a company.

DTO means:

A safe object that is sent to another layer.

Think of it like this:

MongoDB Document
│
▼
DTO (Safe Data)
│
▼
Frontend

The DTO decides what the outside world is allowed to see.

Why Not Return the Mongoose Document?

A Mongoose document contains:

\_id
\_\_v
password
methods
virtuals
internal metadata

The frontend doesn't need those.

Our Project Rule

From today onwards:

Controllers and services will never return raw MongoDB documents.

They will return DTOs.

Step 1 — Create a Mapper

Create a new folder:

src/modules/auth/mappers

Inside it:

user.mapper.js
export const toUserResponse = (user) => {
return {
id: user.\_id.toString(),
name: user.name,
email: user.email,
role: user.role,
};
};

That's it.

Very small.

Step 2 — Service

Instead of:

return {
id: user.\_id,
name: user.name,
email: user.email
}

Do:

import { toUserResponse } from "./mappers/user.mapper.js";

...

return toUserResponse(user);

Now every API returns the same user shape.

Why Is This Better?

Imagine tomorrow we decide to show the profile image.

Old way:

Change 15 controllers.

New way:

toUserResponse()

One place.

Done.

Attacker's Mindset 🛡

Imagine another developer accidentally writes:

return user;

Now password?

Refresh token?

Internal fields?

Maybe leaked.

With a mapper, we have a single safe exit point.

This is another example of Secure by Default.

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

🤔 Why Am I Introducing This Now?

Because we're still a small project.

Changing architecture now is easy.

Changing architecture after 40 APIs?

Painful.

Another Important Topic
What Is Business Logic?

This confuses many developers.

Let's use signup.

Validation:

Email format correct?

Password length?

Name required?

Business Logic:

Email already exists?

User blocked?

Referral valid?

Invite code valid?

Can this user register?

Notice the difference?

Validation checks data.

Business logic checks rules.

This distinction is one of the most common interview questions.

HTTP Status Codes (A Little Deeper)

Most beginners only know:

200

404

500

By the end of this project, you should comfortably use:

Code Meaning Example
200 OK Get profile
201 Created Signup
204 No Content Logout (optional design)
400 Bad Request Invalid body
401 Unauthorized Invalid token
403 Forbidden User has no permission
404 Not Found Product missing
409 Conflict Email already exists
422 Unprocessable Entity Business rule failure (sometimes used)
429 Too Many Requests Rate limit exceeded
500 Internal Server Error Unexpected server issue

Knowing why to use each code makes your APIs much easier to consume.

🧠 Think Like a Senior

Imagine this endpoint:

POST /signup

Two users click Register at exactly the same time using the same email.

Your current code:

const existingUser = await User.findOne({ email });

if (existingUser) {
throw ...
}

await User.create(...)

Looks fine.

But here's the problem:

Request A

↓

findOne()

↓

No User

──────────────

Request B

↓

findOne()

↓

No User

──────────────

Both create()

↓

💥 Duplicate Key Error

This is called a race condition.

How Do Professionals Handle It?

They do both:

Check with findOne() to give a friendly error.
Still rely on MongoDB's unique index as the final protection.
Catch duplicate key errors (E11000) in the error handler or service.

We'll implement that later when we build a custom ApiError.

This is a perfect example of why:

Application validation is helpful, but the database is the final source of truth.

📚 Backend Handbook Notes
DTO

Purpose:

Only expose safe data.

Mapper

Converts

Mongo Document

↓

Frontend Object
Business Logic

Answers

Can this action happen?

Validation

Answers

Is this input correctly formatted?

Secure by Default

Never expose the database document directly.

🎯 Interview Questions
What is a DTO?
Why use a mapper?
Why shouldn't we return MongoDB documents directly?
What is business logic?
What is the difference between validation and business logic?
What is a race condition?
Why is a database unique index still required even if we check findOne()?
📝 Homework (Small but Important)

Before we touch Login:

Create user.mapper.js.
Update signupService() to use it.
Think about the race condition example until you can explain it in your own words.
