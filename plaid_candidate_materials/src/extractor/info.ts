import {
    errorResult,
    ExtractorErrorCode,
  } from '../framework/errors';
import {
    Info,
    InfoAddress,
    Session,
} from '../framework/model';
import { ExtractionResult } from '../framework/plugin';
import { asyncRequest } from '../framework/requests';

const baseUrl = 'http://firstplaidypus.herokuapp.com';

/**
 * Extracts the address information through string manipulation.
 * 
 * @param json The address array.
 * 
 * E.g. ["123 Center Street", "Salt Lake City, UT 84102-1234"]
 * 
 * An exception on a splitting an undefined value will be cause by the calling function.
 */
function extractAddress(json : Array<string>): InfoAddress {
    const street = json[0];
    let cityStateZip = json[1];
    const cityStateZipSplit = cityStateZip.split(',');
    const stateZipTrim = cityStateZipSplit[1].trim();
    const stateZipSplit = stateZipTrim.split(' ');
    const city = cityStateZipSplit[0];
    const state = stateZipSplit[0];
    const zipFull = stateZipSplit[1];
    const zip = zipFull.split('-')[0];

    if(!street || !city || !state || !zip) {
        throw new Error('Address: invalid input');
    }

    const address: InfoAddress = {
        street: street,
        city: city,
        state: state,
        zip: zip,
    };

    return address;
}

/**
 * Extracts customer information such as name, email, phone and address.
 * 
 * @param session The session object.
 */
export const extractInfo = async (
    session: Session,
  ): Promise<ExtractionResult<Info>> => {
      return new Promise<ExtractionResult<Info>>(async (resolve, reject) => {
        // Request user settings information.
        const infoResponse = await asyncRequest<string>(
            baseUrl + '/settings/user',
            {
              method: 'GET',
              jar: session.jar,
            },
          );
      
          // Verify status codes.
          if(infoResponse.statusCode === 401) {
            reject(errorResult(ExtractorErrorCode.InvalidCredentials));
          }
          else if(infoResponse.statusCode === 200) {
            const body = infoResponse.body;
            const startingIndex = body.indexOf('{');
            const endingIndex = body.lastIndexOf('}') + 1;
            const jsonString = body.substring(startingIndex, endingIndex);
            const json = JSON.parse(jsonString);

            // On positive response, parse address.
            try {
                const addresss = extractAddress(json.address);
                const phone = json.phone.replace('+', ''); // Remove leading '+' character, if necessary.
                const info: Info = {
                    names: [json.name],
                    phoneNumbers: [phone],
                    emails: [json.email],
                    addresses: [addresss]
                };
    
                resolve({data: info});                
            } catch (error) {
                reject(errorResult(ExtractorErrorCode.InstitutionRequestError))
            }
          }
      });    
  };