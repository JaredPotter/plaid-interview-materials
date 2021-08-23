import { Extractor } from '../framework/plugin';
import { extractAccounts } from './accounts';
import { extractInfo } from './info';
import { extractTransactions } from './transactions';
import { login } from './login';

export const extractor: Extractor = {
  login,
  extractAccounts,
  extractInfo,
  extractTransactions,
};
