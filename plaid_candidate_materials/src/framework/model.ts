import { CookieJar } from './requests';

export interface Credentials {
  username: string;
  password: string;
  mfa: {[question: string] : string}
}

export interface Session {
  jar: CookieJar;
}

// A unique, opaque key used to associate an account with other pieces of data
// that belong to that account (e.g. transactions).
export type AccountIndex = string;

export type AccountType = 'credit' | 'depository' | 'loan';

export interface Account {
  type: AccountType;
  nickname: string;
  officialName: string;
  currentBalance: number;
  availableBalance: number | null;
  // Last 4 digits of account number.
  mask: string;
  // Ephemeral metadata that can be used to pass session specific data about
  // the account to subsequent extraction steps (e.g. extractTransactions).
  rawEphemeral?: any;
}

export interface InfoAddress {
  country?: string;
  zip?: string;
  state: string;
  city: string;
  street: string;
}

export interface Info {
  names: Array<string>;
  emails: Array<string>;
  phoneNumbers: Array<string>;
  addresses: Array<InfoAddress>;
}

export type DateIso8601 = string; // YYYY-MM-DD

export interface Transaction {
  // Use a positive amount for transactions where money flows out of the
  // account. Use a negative amount for transactions where money flows into
  // the account.
  amount: number;
  date: DateIso8601;
  description: string;
  pending: boolean;
}

export interface FullResult {
  accounts?: Map<AccountIndex, Account>;
  info?: Info;
  transactions?: Map<AccountIndex, Array<Transaction>>;
}
