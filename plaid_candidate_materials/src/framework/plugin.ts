import { ExtractorErrorCode } from './errors';
import {
  Account,
  Credentials,
  DateIso8601,
  Info,
  Session,
  Transaction,
} from './model';

export interface ExtractorError {
  code: ExtractorErrorCode;
  description: string;
  object?: Error;
}

export interface ErrorResult {
  error: ExtractorError;
}

export interface SessionResult {
  session: Session;
}

export interface DataResult<T> {
  data: T;
}

export type ExtractionResult<T> = ErrorResult | DataResult<T>;

export const isErrorResult = (
  result: ErrorResult | {},
): result is ErrorResult => (result as ErrorResult).error != null;

export type LoginResult = ErrorResult | SessionResult;

export interface TransactionOptions {
  startDate: DateIso8601;
  endDate: DateIso8601;
}

// Interface that defines the contract for an extractor.
export interface Extractor {
  login: (creds: Credentials) => Promise<LoginResult>;
  // The following calls may assume that login() has already been called,
  // but should not make any other ordering assumptions.
  extractAccounts: (session: Session) =>
    Promise<ExtractionResult<Array<Account>>>;
  extractInfo?: (session: Session) => Promise<ExtractionResult<Info>>;
  // extractTransactions should return all the transactions within the
  // requested time interval, and no transactions outside the time interval.
  extractTransactions?: (
    session: Session,
    account: Account,
    options: TransactionOptions,
  ) => Promise<ExtractionResult<Array<Transaction>>>;
}
