## Wallet + Ajo (Rotational Savings) Demo

A mini fintech-style **full-stack demo** that implements a **Wallet + Ajo (rotational savings)** system.
Built with **Next.js, TypeScript, Tailwind CSS, and Supabase**, the app demonstrates how verified users can manage wallet balances, join rotational savings groups, contribute per cycle, and receive payouts in a controlled and secure flow.



**Live Demo:** *(https://remittra-mu.vercel.app)*
**GitHub Repo:** *(https://github.com/Full-Stack-Sanctus/Remittra)*

---

### Key Features (Brief)

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

### Security Model

* **Supabase Row Level Security (RLS)** enforced on all core tables

  * Users can only read/write their own wallet, contributions, and memberships
  * Admin-only actions restricted via `is_admin` policies

* **Frontend uses only the public anon key - supabaseClient**

* **Service Role Key is used server-side only** (API routes / server actions) for:

  * Controlled system actions that must bypass RLS safely

* **No service keys are exposed to the client**

---

### Tech Stack

* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
* **Backend / Data:** Supabase (Auth, Postgres, RLS – public schema)
* **DevOps:** Vercel deployment, GitHub Actions CI

---

### Disclaimer

This is a **technical demo**.
No real money, payments, or financial integrations are involved.
A production fintech system would require server-side enforcement, audits, and regulated payment providers.

---

**Built by:** Obasi Sanctus Ebuka

