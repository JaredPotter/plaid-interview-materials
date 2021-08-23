import 'source-map-support/register';

import * as uuid from 'uuid';
import * as fs from 'fs';

import { extractor } from './extractor';
import { convertThrownValue } from './framework/errors';
import {
  Account,
  AccountIndex,
  Credentials,
  FullResult,
  Info,
  Transaction,
} from './framework/model';
import {
  ExtractionResult,
  isErrorResult,
  TransactionOptions,
} from './framework/plugin';

const extract = async (
  creds: Credentials,
  options: TransactionOptions,
): Promise<ExtractionResult<FullResult>> => {
  const accounts = new Map<AccountIndex, Account>();
  const transactions = new Map<AccountIndex, Array<Transaction>>();
  let info: Info | undefined = undefined;

  try {
    // Login Handler.
    const loginResult = await extractor.login(creds);
    if (isErrorResult(loginResult)) {
      return loginResult;
    }
    const session = loginResult.session;

    // Account Results Handler.
    const accountsResult = await extractor.extractAccounts(session);
    if (isErrorResult(accountsResult)) {
      return accountsResult;
    }

    for (const account of accountsResult.data) {
      accounts.set(uuid.v4(), account);
    }

    if (extractor.extractInfo != null) {
      const infoResult = await extractor.extractInfo(session);
      if (isErrorResult(infoResult)) {
        return infoResult;
      }
      info = infoResult.data;
    }

    if (extractor.extractTransactions != null) {
      for (const [accountIndex, account] of accounts) {
        if (['credit', 'depository'].includes(account.type)) {
          const transactionsResult =
            await extractor.extractTransactions(session, account, options);
          if (isErrorResult(transactionsResult)) {
            return transactionsResult;
          }
          transactions.set(accountIndex, transactionsResult.data);
        }
      }
    }
  } catch (err) {
    console.log(err);
    return convertThrownValue(err);
  }

  return {
    data: {
      accounts,
      info,
      transactions,
    },
  };
};

const generateJSON = (blob: any) => JSON.stringify(blob, (key, value) => {
  if (value instanceof Error) {
    return value.stack;
  }
  if (value instanceof Map) {
    return Array.from(value.entries());
  }
  return value;
}, 2);

(async () => {
  console.log('starting extraction');

  // Enter test credentials here.
  const creds = {
    username: 'user0',
    password: 'password',
    // username: 'user4',
    // password: 'plaid',
    // mfa: {
    //   'What was your first car?': 'plaidilac',
    //   'What is your favorite trash bag brand?': 'plad',
    //   'What is your favorite color?': 'plaid',
    // }
  };

  // Enter start and end date here.
  const options = {
    // endDate: '2016-01-01',
    // startDate: '2018-04-01',
    startDate: '2016-01-01',
    endDate: '2019-04-30',
  };

  const result = await extract(creds, options);
  console.log(generateJSON(result));
  fs.writeFileSync('output.json', generateJSON(result));
})();
