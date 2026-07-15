📚 Lesson Notes - Phase 3.1 (User Model)
Topic

Creating a secure User Model using Mongoose.

What We Learned

1. A Model Represents Data
   User Model

↓

Defines

↓

Fields

↓

Validation

↓

Methods

↓

Middleware

The model should contain behavior related to the user itself.

2. Never Trust req.body

❌ Bad

User.create(req.body)

Because attackers can send:

{
"role":"admin"
}

Always extract only the required fields.

const { name, email, password } = req.body; 3. select:false

Purpose:

Hide sensitive fields automatically.

Without

User.findOne()

↓

Password Returned

With

User.findOne()

↓

Password Hidden

This is called

Secure by Default

4. Password Hashing

Never store:

123456

Store:

$2b$10....

Hashing is one-way.

5. Why pre("save")?

Before saving

User

↓

Hash Password

↓

MongoDB

Automatic.

Controllers never hash passwords.

6. Why isModified()

Without

Already Hashed Password

↓

Hash Again

↓

Login Breaks

Only hash if password changed.

7. comparePassword()

Instead of

bcrypt.compare(...)

everywhere,

Create one method.

Cleaner.

Reusable.

⭐ Senior Notes

Good models own their own behavior.

Bad controllers contain business logic.

Controllers should coordinate.

Models should know themselves.

⚠ Beginner Mistakes

❌ Save password as plain text

❌ Hash password inside controller

❌ Return password in response

❌ Trust req.body

❌ Forget select:false

🛡 Attacker's Mindset

How would I attack this API?

Attack 1

Send

{
"role":"admin"
}

Defense

Never trust req.body.

Attack 2

Hope password comes back in API response.

Defense

select:false

Attack 3

Steal database.

Defense

Passwords are hashed.

🎯 Interview Questions

Why do we use select:false?

Why hash passwords?

What is bcrypt?

What is pre("save")?

What does isModified() do?

Where should password hashing happen?

Why should controllers not hash passwords?

📝 Homework

Explain

select:false
pre("save")
comparePassword()
isModified()

without looking at code.
