## Wallet + Ajo (Rotational Savings) Demo

This is an app with the following features:
+ Wallet funding/withdrawal
+ Ajo creation/joining
+ Contribution per cycle
+ Payout rotation
+ Admin toggle for KYC & advancing cycles


Built with **Next.js, TypeScript, Tailwind CSS, and Supabase**, the app demonstrates how verified users can manage wallet balances, join rotational savings groups, contribute per cycle, and receive payouts in a controlled and secure flow.



**Live Demo:** *(https://remittra-mu.vercel.app)*
**GitHub Repo:** *(https://github.com/Full-Stack-Sanctus/Remittra)*

---

### Key Features

* **Authentication & Users**

  * Supabase email/password auth
  * User profiles with KYC verification flag
  * Admin role for demo controls

* **Wallet**

  * NGN wallet with available & locked balances
  * Transaction history (deposit, withdrawal)
  * Balance validation before operations

* **Ajo (Rotational Savings)**

  * Create and join Ajo groups
  * Fixed cycle amount & duration
  * One contribution per cycle
  * Automatic payout rotation
  * Manual cycle advancement (admin demo)

* **Admin Controls (Demo)**

  * Verify / unverify KYC
  * Advance Ajo cycles
  
---

### Security

* **Security Model (App Router + Supabase)**

  * Admin-only actions restricted via `is_admin` policies
  * Client → fetch("/api/...")
  * Server → cookies() + supabase.auth.getUser()

* **Supabase Row Level Security (RLS)** enforced on all core tables

  * Users can only read/write their own wallet, contributions, and memberships
  * Admin-only actions restricted via `is_admin` policies

* **Frontend uses only the public anon key - supabaseClient**

* **Service Role Key is used server-side only** (API routes / server actions) for:

  * Controlled system actions that must bypass RLS safely

* **No service keys are exposed to the client**

---


### Edge Functions 

#### Create a function to clear expired invites

CREATE OR REPLACE FUNCTION clear_expired_ajos_invites()
RETURNS void AS $$
BEGIN
    UPDATE ajos
    SET 
        invitation_url = NULL,
        invite_expires_at = NULL,
        is_clicked = FALSE
    WHERE invite_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

---

### Database Schema (Simplified)

```sql
-- Users
users (
  id uuid PRIMARY KEY,      -- matches auth.users.id
  email text,
  kyc_verified boolean,
  is_admin boolean
);

-- Wallets
wallets (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  available_balance numeric DEFAULT 0,
  locked_balance numeric DEFAULT 0
);

-- Wallet Transactions
wallet_transactions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  amount numeric,
  type text CHECK (type IN ('deposit','withdraw','contribution','payout')),
  created_at timestamptz DEFAULT now()
);

-- Ajo Groups
ajos (
  id uuid PRIMARY KEY,
  name text,
  cycle_amount numeric,
  cycle_duration int,      -- in days
  current_cycle int DEFAULT 1,
  created_by uuid REFERENCES users(id),
  invitation_url TEXT,
  invite_expires_at TIMESTAMPTZ,
  is_clicked BOOLEAN DEFAULT FALSE
);

--ajo_invite (
  id uuid PRIMARY KEY,
  ajo_id uuid REFERENCES ajos(id),
  code text UNIQUE NOT NULL
  cycle_duration int,      -- in days
  created_at_timestamp with tome zone default now()
);

-- Ajo Members
user_ajos (
  ajo_id uuid REFERENCES ajos(id),
  user_id uuid REFERENCES users(id),
  position int,
  PRIMARY KEY (ajo_id, user_id)
);

-- wallet transaction
wallet_transactions (
  user_id uuid REFERENCES users(id),
  typescript text check (type in ('depoeit', withdraw')) not null,
  amount numeric,
  created_at_timestamp with tome zone default now()
);
```

---

### Policies

```sql
-- Only allow insert with is_admin = false
create policy "users_insert_default_admin_false"
on users
for insert
with check (is_admin = false);
```
---

### Tech Stack

* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
* **Backend / Data:** Supabase (Auth, Postgres, RLS – public schema)
* **DevOps:** Vercel deployment, GitHub Actions CI
 
---

### Migrations / Setup

#### **Clone the repo**

```bash
git clone https://github.com/Full-Stack-Sanctus/Remittra.git
cd Remittra
```

#### **Install dependencies**

```bash
npm install
```

#### **Set up environment variables**
   Create `.env.local`:

```env
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
ADMIN_EMAIL  // use this in my middleware to checkmate user and admin login 
```

#### **Initialize Supabase**

Schema: Already defined in Supabase (public schema). No migrations needed for this demo.

Seed Data: Pre-populated test users, for demo purposes.

```bash
# If using Supabase CLI for production 
supabase db push    
```

#### **Run locally**

```bash
npm run dev
```

App runs on [http://localhost:3000](http://localhost:3000)

---

## Admin / Test Users

| Role  | Email                                         | Password | Notes                         |
| ----- | --------------------------------------------- | -------- | ----------------------------- |
| Admin | [admin@demo.com]                              | Admin123! | KYC verified, can manage Ajos |
| User  | [user@demo.com]                               | User123! | Regular participant           |

### All test users exist in Supabase seed/migrations. Admin operations use **service role key** on server-side endpoints.

---

## Deployment (DevOps / CI)

+ Deployment: Vercel via GitHub Actions

+ CI Pipeline:

+ Install dependencies (npm install)

+ Lint code (ESLint) and auto-fix formatting issues with Prettier

+ TypeScript type check to catch type errors

+ Build Next.js app

+ Deploy to production

---

## Notes

* This is a **demo project**; no real money is handled.
* Focus is on **clarity, full-stack structure, RLS security, and product-minded design**.
* Server-side enforcement with service role key demonstrates **best practices for sensitive operations**.

---

## Assumptions

This demo logic was implemented manually but using Supabase Edge Functions is assumed to be faster, easier to maintain, and more secure than implementing equivalent logic manually, especially when leveraging RLS and service role keys.

Real-world financial applications would require additional server-side validation and payment provider integration.

---

**Built by:** Obasi Sanctus Ebuka

---