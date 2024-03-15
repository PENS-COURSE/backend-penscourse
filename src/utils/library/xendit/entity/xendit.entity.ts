export interface Xendit {
  id?: string;
  external_id?: string;
  user_id?: string;
  status?: string;
  merchant_name?: string;
  merchant_profile_picture_url?: string;
  locale?: string;
  amount?: number;
  description?: string;
  expiry_date?: Date;
  invoice_url?: string;
  available_banks?: AvailableBank[];
  available_retail_outlets?: AvailableRetailOutlet[];
  available_ewallets?: AvailableEwallet[];
  available_qr_codes?: AvailableQrCode[];
  available_direct_debits?: AvailableDirectDebit[];
  available_paylaters?: AvailablePaylater[];
  should_exclude_credit_card?: boolean;
  should_send_email?: boolean;
  success_redirect_url?: string;
  failure_redirect_url?: string;
  created?: Date;
  updated?: Date;
  currency?: string;
  items?: Item[];
  customer?: Customer;
}

export interface AvailableBank {
  bank_code?: string;
  collection_type?: CollectionType;
  transfer_amount?: number;
  bank_branch?: BankBranch;
  account_holder_name?: AccountHolderName;
  identity_amount?: number;
}

export enum AccountHolderName {
  RexyStore = 'REXY STORE',
}

export enum BankBranch {
  VirtualAccount = 'Virtual Account',
}

export enum CollectionType {
  Pool = 'POOL',
}

export interface AvailableDirectDebit {
  direct_debit_type?: string;
}

export interface AvailableEwallet {
  ewallet_type?: string;
}

export interface AvailablePaylater {
  paylater_type?: string;
}

export interface AvailableQrCode {
  qr_code_type?: string;
}

export interface AvailableRetailOutlet {
  retail_outlet_name?: string;
}

export interface Customer {
  given_names?: string;
}

export interface Item {
  name?: string;
  price?: number;
  quantity?: number;
}

export interface XenditCallback {
  id?: string;
  external_id?: string;
  user_id?: string;
  is_high?: boolean;
  payment_method?: string;
  status?: string;
  merchant_name?: string;
  amount?: number;
  paid_amount?: number;
  bank_code?: string;
  paid_at?: Date;
  payer_email?: string;
  description?: string;
  adjusted_received_amount?: number;
  fees_paid_amount?: number;
  updated?: Date;
  created?: Date;
  currency?: string;
  payment_channel?: string;
  payment_destination?: string;
}
