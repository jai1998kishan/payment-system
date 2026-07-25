📚 Backend Handbook Notes
Money Should Never Be Stored As Floating-Point Values

Instead of:

₹999.99

Store:

99999

(paise)

Benefits:

Exact calculations.
No floating-point rounding errors.
Matches Razorpay's API.
Safer financial reporting.

===============================================

📚 Backend Handbook Notes
Product Schema Design

Group fields by purpose:

Basic Information
Pricing
Inventory
Media
Status

This makes the schema much easier to read and maintain.

=====================================================

📚 Backend Handbook Notes
File Upload Security Checklist

Always validate:

Number of files.
Maximum file size.
Allowed MIME types.
Generate your own object keys.
Never trust file names from the client.

====================================================

📚 Backend Handbook Notes
Why Memory Storage?

Use memory storage when:

Files are uploaded immediately to cloud storage.
Files are small.
You don't need to keep local copies.

Avoid disk storage unless your application genuinely requires local file processing.

====================================================

📚 Backend Handbook Notes
Multer Responsibilities
Parse multipart/form-data.
Enforce file count limits.
Enforce file size limits.
Run the file filter.

It does not upload files.

=================================================
