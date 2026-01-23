export interface User {
  id: string;
  email: string;
  name: string;
  wallet_balance: number;
  kyc_verified: boolean;
  is_admin: boolean;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  created_at: string;
}

export interface Ajo {
  id: string;
  name: string;
  created_by: string;
  cycle_amount: number;
  current_cycle: number;
}

export interface AjoMember {
  id: string;
  ajo_id: string;
  user_id: string;
}

export interface AjoContribution {
  id: string;
  ajo_id: string;
  user_id: string;
  cycle_number: number;
  amount: number;
  paid: boolean;
}

export interface AjoPayout {
  id: string;
  ajo_id: string;
  user_id: string;
  cycle_number: number;
  amount: number;
  paid: boolean;
}
