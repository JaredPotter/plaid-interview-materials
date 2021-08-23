const csvParse = require('csv-parse/lib/sync'); // tslint:disable-line
import * as cheerio from 'cheerio';

import {
  errorResult,
  ExtractorErrorCode,
} from '../framework/errors';
import {
  Session,
  Transaction,
  Account
} from '../framework/model';
import { ExtractionResult, TransactionOptions } from '../framework/plugin';
import { asyncRequest } from '../framework/requests';
const baseUrl = 'http://firstplaidypus.herokuapp.com/'

// Helper for parsing CSV response body, including header row if present.
export const parseCSV = (
  data: string,
): Array<Array<string>> => csvParse(data);

export const extractTransactions = async (
  session: Session,
  account: Account,
  options: TransactionOptions,
  ): Promise<ExtractionResult<Array<Transaction>>> => {
    return new Promise<ExtractionResult<Array<Transaction>>>(async (resolve, reject) => {
      const startDate = new Date(options.startDate);
      const endDate = new Date(options.endDate);

      if(startDate > endDate) {
        reject(errorResult(ExtractorErrorCode.InstitutionRequestError)); // Start date is after end date. Return institution request error.
      }

      let data: Array<Transaction> = [];
      const accountId = (account.rawEphemeral && account.rawEphemeral.accountId) ? account.rawEphemeral.accountId : '';

      // After grabbing account id, remove rawEphemeral from account.
      delete account.rawEphemeral;

      if(!accountId) {
        reject(errorResult(ExtractorErrorCode.InstitutionRequestError)); // No account ID will result in return an error since it is required for following steps.
      }

      const transactionDownloadUrl = baseUrl + 'download';

      // Request transaction CSV download.
      const transactionResponse = await asyncRequest<string>(
        transactionDownloadUrl,
          {
            method: 'POST',
            jar: session.jar, // not required as endpoint is unauthenticated.
            form: {
              account_id: accountId,
              start_date: options.startDate,
              end_date: options.endDate,
            }
          },
      );

      // Verify status code.
      if(transactionResponse.statusCode === 200) {
        const parsedCSV = parseCSV(transactionResponse.body);        

        // Iterate over all CSV rows - excluding the first header row.
        for(let i = 1; i < parsedCSV.length; i++) {
          const row = parsedCSV[i];

          if(row[1] === 'None') {
            // Skip transactions that do not have an actual date. Although some of these could be pending transactions, those will be picked later in this function.
            continue;
          }

          const date = new Date(row[1]);
          const formattedDate = date.toISOString().split('T')[0];
          const amount = Number(row[2]);
          const description = row[3];

          if(!date || !formattedDate || !amount || !description) {
            reject(errorResult(ExtractorErrorCode.InstitutionRequestError)); // If one of the values isn't set, we return an error.
          }

          const transaction: Transaction = {
              date: formattedDate,
              amount: amount,
              description: description,
              pending: false,
          };

          data.push(transaction);
        }        
      }
      else {
        reject(errorResult(ExtractorErrorCode.InstitutionRequestError)); // Anything other than a 200 response status code is considered an error.
      }

      // Fetch Pending Transactions.
      const accountTransactionsUrl = baseUrl + 'accounts/' + accountId;

      // Request account transactions page.
      const accountTransactionsResponse = await asyncRequest<string>(
        accountTransactionsUrl,
        {
          method: 'GET',
          jar: session.jar,
        }
      );

      // Verify status code.
      if(accountTransactionsResponse.statusCode === 200) {
        const html = cheerio.load(accountTransactionsResponse.body);
        const pendingTransactions = html('.pending tbody tr');

        // Iterate over all pending items.
        pendingTransactions.each((i, elem) => {
          const transaction = cheerio.load(elem);
          const date = transaction('td:nth-child(1)').text();
          const description = transaction('td:nth-child(2) > div > div').text();
          const amount = Number(transaction('td:nth-child(3)').text());
          const t: Transaction = {
            date: date,
            amount: amount,
            description: description,
            pending: true,
          };
          const transactionDate = new Date(date);

          // Only add transaction if it is within date range.
          if(transactionDate >= startDate && transactionDate <= endDate) {
            data.push(t);
          }
        });

        resolve({data});        
      }
      else {
        reject(errorResult(ExtractorErrorCode.InstitutionRequestError)); // Anything other than a 200 response status code is considered an error.
      }
    });
}
