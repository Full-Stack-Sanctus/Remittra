// lib/types.ts

export type UserRow = {
  id: string;
  email: string;
  name?: string | null;
  wallet_balance: number;
  kyc_verified: boolean;
  is_admin: boolean;
};

export type WalletTransactionRow = {
  id: string;
  user_id: string;
  type: "deposit" | "withdraw";
  amount: number;
  created_at: string;
};

export type AjoRow = {
  id: string;
  name: string;
  created_by: string;
  cycle_amount: number;
  current_cycle: number;
};

export type AjoMemberRow = {
  id: string;
  ajo_id: string;
  user_id: string;
};

export type AjoContributionRow = {
  id: string;
  ajo_id: string;
  user_id: string;
  cycle_number: number;
  amount: number;
  paid: boolean;
};

export type AjoPayoutRow = {
  id: string;
  ajo_id: string;
  user_id: string;
  cycle_number: number;
  amount: number;
  paid: boolean;
};
