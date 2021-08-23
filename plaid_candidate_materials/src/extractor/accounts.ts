import * as cheerio from 'cheerio';

import {
  Account,
  AccountType,
  Session,
} from '../framework/model';
import { ExtractionResult } from '../framework/plugin';
import { asyncRequest } from '../framework/requests';
import { errorResult, ExtractorErrorCode } from '../framework/errors';

const baseUrl = 'http://firstplaidypus.herokuapp.com/';
/**
 * Removes the $ character.
 * 
 * @param balance The balance amount.
 */
const parseBalance = (
  balance: string,
): number => parseFloat(balance.replace('$', ''));

/**
 * Translates the official account type.
 * 
 * @param officialName The official account type.
 */
const convertAccountType = (
  officialName: string,
): AccountType => {
  switch (officialName) {
    case 'Personal Checking':
    case 'Business Savings':
      return 'depository';
    case 'Travel Rewards Mastercard':
      return 'credit';
    case 'Auto Navigator Loan':
    case '10/1 Adjustable':
      return 'loan';
    default:
      throw Error(`unknown account type: ${officialName}`);
  }
};

/**
 * Extracts the accounts information for a particular customer.
 * 
 * @param session The session object.
 */
export const extractAccounts = async (
  session: Session,
): Promise<ExtractionResult<Array<Account>>> => {
  return new Promise<ExtractionResult<Array<Account>>> (async (resolve, reject) => {
    // Request user accounts.
    const accountsResponse = await asyncRequest<string>(
      baseUrl + 'accounts',
      {
        method: 'GET',
        jar: session.jar,
      },
    );
  
    // Verify status code.
    if(accountsResponse.statusCode === 200) {
      const html = cheerio.load(accountsResponse.body);
      const accountRows = html('.accountrow');
      const accounts: Array<Account> = [];
    
      // Parse each account element.
      accountRows.each((i, elem) => {
        const row = cheerio.load(elem);
        const nickname = row('div.left > h4').text();
        const officialName = row('div.left > p').text();
        const availableBalance = parseBalance(row('div.right > h4').text());
        const accountNumber = elem.attribs['data-a-n'];
        const mask = accountNumber.substring(accountNumber.length - 4);
        const type = convertAccountType(officialName);
        const accountId = row('a').attr('href').split('/')[1];

        if(!type || !nickname || !officialName || !availableBalance || !mask || !accountId) {
          reject(errorResult(ExtractorErrorCode.InstitutionRequestError)); // If any fields aren't correctly set, we return an institution request error.
        }

        let payload: Account = {
          type,
          nickname,
          officialName,
          currentBalance: availableBalance,
          availableBalance,
          mask,
        };
    
        if(type === 'credit' || type === 'depository') {
          payload.rawEphemeral = {
            accountId: accountId,
          };
        }
    
        accounts.push(payload);
      });

      resolve({ data: accounts });
    }
    else {
      reject(errorResult(ExtractorErrorCode.InstitutionRequestError)); // A response code other than 200 will result in an institution request error.
    }
  });
};
