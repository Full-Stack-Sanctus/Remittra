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

### Data Fetching & State Management

* **SWR (Stale-While-Revalidate):** Used for efficient, client-side data fetching to ensure:
* **Real-time UI Updates:** Wallet balances and Ajo cycle statuses stay in sync without manual refreshes.
* **Optimistic UI:** Provides a snappy user experience during contributions and withdrawals.
* **Cache Management:** Reduces redundant API calls to Supabase by caching previous fetch results.
  * 

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

### Databse Functions

#### -- 1. Create the function to add new users to auth and that inserts the wallet
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- 1. Insert into public.users (This part is usually fine)
  INSERT INTO public.users (id, email, full_name, is_admin, kyc_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    false,
    false
  );

  -- 2. Insert into public.wallets 
  -- We ONLY insert the user_id. The database will fill in the 0s automatically.
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$;

-- the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();
```

#### 2. automatically update name of ajo in ajo_name column after an every insert in user_ajos
```sql
CREATE OR REPLACE FUNCTION sync_ajo_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Look up the name from the 'ajos' table using the new record's ajo_id
  SELECT name INTO NEW.ajo_name
  FROM ajos
  WHERE id = NEW.ajo_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- the triggert
CREATE TRIGGER trigger_sync_ajo_name
BEFORE INSERT OR UPDATE ON user_ajos
FOR EACH ROW
EXECUTE FUNCTION sync_ajo_name();
---
```

#### 3. Create a function to clear expired invites
```sql
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
```

#### 4. Universal notification functions
```sql
CREATE OR REPLACE FUNCTION public.push_user_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  target_user_id uuid;
BEGIN
  -- Logic to find the owner of the notification
  -- If table is 'messages', look for 'receiver_id', otherwise 'user_id'
  CASE TG_TABLE_NAME
    WHEN 'messages' THEN target_user_id := NEW.receiver_id;
    WHEN 'group_invites' THEN target_user_id := NEW.invited_user_id;
    ELSE target_user_id := NEW.user_id;
  END CASE;

  -- Build a standard envelope so the Frontend always knows the format
  payload := jsonb_build_object(
    'type', TG_TABLE_NAME, 
    'action', TG_OP, -- INSERT, UPDATE, or DELETE
    'data', to_jsonb(NEW),
    'metadata', jsonb_build_object('sent_at', now())
  );

  PERFORM realtime.send(
    payload,
    'SYSTEM_NOTIFICATION',
    'user:' || target_user_id::text,
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- the trigger for wallet_transactions insert notifications
CREATE TRIGGER on_wallet_transaction_insert
AFTER INSERT ON public.wallet_transactions
FOR EACH ROW 
EXECUTE FUNCTION public.push_user_notification();
```

---


### Edge Functions 



---


### Database Schema (Simplified)

```sql
-- Users
users (
  id uuid PRIMARY KEY,      -- matches auth.users.id
  email text,
  kyc_verified boolean,
  is_admin boolean,
  verification_level INT,
  kyc_status TEXT,
  kyc_notes TEXT,
  passportUrl TEXT
);

-- Wallets
wallets (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  available_balance numeric DEFAULT 0,
  locked_balance numeric DEFAULT 0
);

-- kyc_submissions
kyc_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  tier_requested INT,
  id_image_url TEXT,
  selfie_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT
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

--ajo_invites (
  id uuid PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_email TEXT NOT NULL,
  ajo_id UUID REFERENCES ajos(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  request_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajo Members
user_ajos (
  ajo_id uuid REFERENCES ajos(id),
  user_id uuid REFERENCES users(id),
  ajo_name TEXT NOT NULL,
  is_head,
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


### Databased Logics
#### Speed up filtered lookups for specific users
```sql
CREATE INDEX idx_wallet_transactions_user_type 
ON public.wallet_transactions (user_id, type);
```

#### Speed up chronological sorting
```sql
CREATE INDEX idx_wallet_transactions_created_at 
ON public.wallet_transactions (created_at DESC);
```

---


### Policies

#### 1. Only allow insert with is_admin = false
```sql
create policy "users_insert_default_admin_false"
on users
for insert
with check (is_admin = false);

-- Allow creators to see invites for their groups
CREATE POLICY "Creators can view their group invites" ON ajo_invites
FOR SELECT USING (auth.uid() = created_by);
```

#### 2. Enable RLS on the realtime messages table
```sql
-- Enable RLS on the system's realtime table
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to listen ONLY to their specific topic (e.g., 'user:uuid')
CREATE POLICY "Users can only listen to their own topic" 
ON "realtime"."messages"
FOR SELECT
TO authenticated
USING (
  (topic = 'user:' || auth.uid()::text) 
  AND (extension = 'broadcast')
);
```

---

### Tech Stack

* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, SWR (Data Fetching)
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