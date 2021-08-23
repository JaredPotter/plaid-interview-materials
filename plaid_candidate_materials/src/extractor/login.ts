import {
  errorResult,
  ExtractorErrorCode,
} from '../framework/errors';
import { Credentials } from '../framework/model';
import { LoginResult } from '../framework/plugin';
import { asyncRequest, createJar } from '../framework/requests';
import * as cheerio from 'cheerio';

const baseUrl = 'http://firstplaidypus.herokuapp.com/';

/**
 * Logs a user into their institution account.
 * 
 * @param creds The user credentials - username and password.
 */
export const login = async (
  creds: Credentials,
): Promise<LoginResult> => {
  return new Promise<LoginResult>(async (resolve, reject) => {
    // Create jar session object.
    const jar = createJar();

    if(!creds.username || !creds.password) {
      reject(errorResult(ExtractorErrorCode.InvalidCredentials)); // Technically missing credentials but no error code corresponds to that.
    }
    
    // Request login.
    const loginResponse = await asyncRequest<string>(
      baseUrl + 'login',
      {
        method: 'POST',
        form: {
          username: creds.username,
          password: creds.password
        },
        jar
      },
    );

        // Verify status codes.
        if (loginResponse.statusCode === 302) {
          const location = loginResponse.headers['location'];
          const session = {
              jar: jar
          };
          if (location === 'http://firstplaidypus.herokuapp.com/mfa/') {
              const mfaResponse = await asyncRequest<string>(baseUrl + 'mfa', {
                  method: 'GET',
                  jar: session.jar,
              });

              if (mfaResponse.statusCode === 200) {
                  const mfaBody = mfaResponse.body;
                  const html = cheerio.load(mfaBody);
                  const question = html('.input-group p').text();
                  const answer = creds.mfa[question];
                  const mfaIndex = html('[name="mfa_index"]').attr('value');
                  console.log(mfaIndex)

                  await asyncRequest<string>(
                      baseUrl + 'mfa',
                      {
                        method: 'POST',
                        form: {
                          answer: answer,
                          mfa_index: mfaIndex
                        },
                        jar
                      },
                  );      
              }
          }
          const response = {
              session: {
                  jar: jar
              }
          };
          // Send back session object.
          resolve(response);
      }
    else {
      reject(errorResult(ExtractorErrorCode.InvalidCredentials));
    }
  });
}