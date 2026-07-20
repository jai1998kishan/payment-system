Phase 3.2 — Signup API
Today's Goal

By the end of today's lesson, you'll understand:

How a request flows from Route → Controller → Service
Why we separate Controller and Service
Zod validation
API response standards
Duplicate email handling
HTTP status codes
Why we never return the full MongoDB document
Proper error handling
First, Let's Understand the Architecture

Many beginners build APIs like this:

router.post("/signup", async (req, res) => {
// validation

// check email

// create user

// response

// send email

// generate token

// logs

// analytics

// notifications
});

After a month:

400 Lines

One Function

Impossible to maintain.

Instead

We'll split responsibilities.

Client

↓

Route

↓

Validation

↓

Controller

↓

Service

↓

Database

↓

Response

Each layer has one job.

What Does Each Layer Do?
Route

Job

Match the URL and call the correct controller.

Nothing else.

Example:

POST /auth/signup

↓

signupController
Controller

Think of the controller as a manager.

The manager doesn't do the work.

The manager delegates work.

Controller responsibilities:

Receive validated request
Call service
Return response

That's it.

Service

This is where business logic lives.

Examples:

Check duplicate email
Create user
Send OTP
Generate tokens
Payment verification

The service talks to the database.

Why This Separation?

Imagine tomorrow.

You build:

Mobile App

↓

Uses same signup logic

Instead of duplicating code,

both web and mobile can reuse the same service.

Attacker's Mindset #3

Suppose someone sends:

{
"email":"not-an-email",
"password":"1"
}

Should this reach MongoDB?

No.

Reject it immediately.

That's why validation exists.

Step 1 — Create Validation

Create

modules/auth/auth.validation.js
import { z } from "zod";

export const signupSchema = z.object({
name: z
.string()
.trim()
.min(3, "Name must be at least 3 characters")
.max(50),

email: z
.email("Invalid email")
.transform((email) => email.toLowerCase().trim()),

password: z
.string()
.min(8, "Password must be at least 8 characters")
.max(20),
});
Why Validate Here?

Instead of:

Database

↓

Error

We stop the request before it reaches the database.

Less work.

More secure.

Why Zod?

Many libraries validate.

I prefer Zod because:

Readable
Type-safe
Great error messages
Excellent React integration
Senior Note #7

Validation is not business logic.

Validation answers:

Is the data correctly shaped?

Business logic answers:

Can this user register?

Different responsibilities.

Step 2 — Generic Validation Middleware

We don't want validation inside every controller.

Create

middlewares/validate.middleware.js
export const validate = (schema) => {
return (req, res, next) => {
const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    req.body = result.data;

    next();

};
};
Why safeParse()?

Without:

schema.parse()

Zod throws an exception.

With:

safeParse()

We get an object:

{
success:true
}

or

{
success:false
}

Cleaner.

Why Replace req.body?

Notice:

req.body = result.data;

Why?

Because Zod already transformed the data.

Example:

User enters:

Rocky@Gmail.Com

Now:

rocky@gmail.com

Controller always gets clean data.

Step 3 — Service

Create

modules/auth/auth.service.js
import { User } from "./user.model.js";

export const signupService = async ({ name, email, password }) => {

const existingUser = await User.findOne({ email });

if (existingUser) {
const error = new Error("Email already registered");
error.statusCode = 409;

    throw error;

}

const user = await User.create({
name,
email,
password,
});

return {
id: user.\_id,
name: user.name,
email: user.email,
};
};
Why Return a New Object?

Don't return:

return user;

Because tomorrow,

your schema may contain:

refreshToken
loginAttempts
isBlocked
internal fields

Frontend doesn't need them.

Only return what the client actually needs.

This follows the Principle of Least Privilege.

Attacker's Mindset #4

Suppose later we add:

failedLoginAttempts

isAdmin

refreshToken

If we return the whole document,

those fields leak.

Instead,

create a safe response.

Step 4 — Controller

Create

modules/auth/auth.controller.js
import { signupService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const signup = asyncHandler(async (req, res) => {

const user = await signupService(req.body);

return res.status(201).json(
new ApiResponse(
201,
"User registered successfully",
user
)
);
});

Notice how small it is.

That's exactly what we want.

Step 5 — Route

Create

modules/auth/auth.routes.js
import { Router } from "express";
import { signup } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { signupSchema } from "./auth.validation.js";

const router = Router();

router.post(
"/signup",
validate(signupSchema),
signup
);

export default router;
Step 6 — Main Route

Later we'll have:

/auth

/products

/payments

/complaints

So create

routes/index.js
import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";

const router = Router();

router.use("/auth", authRoutes);

export default router;

Then in app.js:

import routes from "./routes/index.js";

app.use("/api/v1", routes);

Now our endpoint becomes:

POST

/api/v1/auth/signup
Why /api/v1?

Imagine after one year.

You release Version 2.

Old mobile apps still use Version 1.

Now you can have:

/api/v1

/api/v2

Without breaking existing clients.

HTTP Status Codes

Signup creates a new resource.

Use:

201 Created

Not:

200 OK

Duplicate email?

409 Conflict

Invalid data?

400 Bad Request

Server crash?

500 Internal Server Error

Using the correct status codes makes your API more expressive and easier for clients to handle.

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

🛡 Attacker's Mindset
Attack 1

Send:

{
"role":"admin"
}

Defense:

Only pass:

{
name,
email,
password
}
Attack 2

Send:

{
"email":"invalid"
}

Defense:

Zod validation.

Attack 3

Hope the API returns the password.

Defense:

select: false
Safe response object
Attack 4

Register the same email repeatedly.

Defense:

Duplicate email check + 409 Conflict.

(Later we'll also enforce a unique index in MongoDB and handle duplicate key errors, because application checks alone are not enough under concurrent requests.)

📚 Backend Handbook Notes (Phase 3.2)
Request Flow
Route

↓

Validation

↓

Controller

↓

Service

↓

Database

↓

Response
Responsibilities

Route

URL mapping

Validation

Validate request format

Controller

Coordinate request/response

Service

Business logic
Principles Learned
Single Responsibility Principle (SRP)
Don't Trust User Input
Least Privilege
Secure by Default
Keep Controllers Thin
🎯 Interview Questions
Why should controllers be small?
Why use a service layer?
Why validate before the database?
What is the difference between validation and business logic?
Why return 201 instead of 200 after signup?
Why shouldn't we return the full MongoDB document?
What is the purpose of API versioning (/api/v1)?
🎓 Homework

Before moving to login, make sure you can explain without looking at the code:

Why do we have Route → Controller → Service?
Why is Zod middleware separate?
Why do we return a safe response instead of the whole user document?
Why is 201 Created the correct status code?
Why does the controller stay so small?
⭐ One Suggestion Before We Continue

Starting in the next lesson (Login), I'd like to introduce one more practice that real backend teams use: testing every endpoint as we build it.

For each API we'll cover:

The expected request body.
The expected success response.
Common error responses.
How to test it using Postman (and later, how to automate those tests).

This way, you're not only writing APIs—you'll also learn how to verify and debug them like a backend developer in a real team.
