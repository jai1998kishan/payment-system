The Correct Flow

                User
                  │
                  ▼
          React Frontend
                  │
                  ▼
        Express Backend
                  │
                  ▼
      Razorpay Order API
                  │
                  ▼
          Razorpay Server
                  │
          Returns Order
                  │
                  ▼
        Express Backend
                  │
                  ▼
          React Frontend
                  │
                  ▼
      Razorpay Checkout
                  │
                  ▼
        User Pays Money
                  │
                  ▼
        Razorpay Server
                  │
                  ▼
          Payment Result
                  │
                  ▼
          React Frontend
                  │
                  ▼
         Verify Signature (Backend)
                  │
                  ▼
                Save Payment
                   │
                   ▼
                Success

Payment Flow

Frontend

↓

Backend

↓

Razorpay

↓

Frontend

↓

Backend Verification

↓

Database
