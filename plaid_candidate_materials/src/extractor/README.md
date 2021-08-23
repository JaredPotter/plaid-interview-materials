My general strategy for all extractors is to wrap all functionality into a new promise, perform necessary network requests, validate inputs and status codes, and respond with the correct resolve/reject calls.

Overall thoughts
I thought this coding challenge did a great job of really exploring the multiple facets of extracting information through the web. From performing actual API calls for logging in, and retrieving data to leveraging Cheerio to manually parsing HTML to a classic CSV file parse it presented numerous challenges I really enjoyed solving.


Login:
-I perform input validation on the username and password existing.
-The "trick" was creating a session jar to be passed into the request. Other than that, 

Account:
-Mask was initially not working (by design). I utilized Cheerio to pull out the actual account #, and grab the last 4.
-Wrapped inner function in a new Promise to handle resolve/reject accordingly.

Info:
-Initially almost started to use Cheerio to parse HTML before finding /settings/user api endpoint.
-Extracted out the address parser into its own modular function.

Transactions:
-I perform input validation that the start date isn't before the end date.
-From looking at the Account interface I found the rawEphemeral property. I leverage this to pass in the accountId while fetching the account information. This accountId is then used when retrieving the transactions. Later on I delete this property to not expose it in the final output.
-I make the assumption that transactions downloaded through the /downloads endpoint with a date of 'None' can be ignored. On the checking account specifically, 4 of the transactions with the date of 'None' were seemingly the same transactions as the 4 pending transactions on the account transactions page. However, other transactions were also downloaded but were not on the pending list. In my primary loop that processes the transactions from the CSV file I opt to skip (continue) over these transactions, and ones that are truly pending are picked up when I parse those separately later on in the extractTransactions() function.

Side notes:
-firstplaidypus.herokuapp.com doesn't use HTTPS. In a real world situation I'd report this to the bank as a critical security shortcoming that must be address. No one should ever enter their username/password into a non-HTTPS website.
-/download for the CSV is un-authenticated - the session isn't actually required. I tested this by directly calling the endpoint in Postman without a session. In a real world scenario I'd report this to the bank as a serious security vulnerability.
-There's 2 packages that need to be updated: ts-lint and cheerio. Severity ranges from moderate to high.

Error Handling
-Inside of src/framework/error.ts is mentions that if there's an error case no handled that one can be added. However, in the original project requirements it only says to hand in the src/extractor folder. If the intention is to allow candidates to add their own errors, then I'd suggest making errors.ts part of the turn in code.
-For cases where input validation or a failed response code, I return an InstitutionRequestError. Although it didn't feel like the best message I leveraged it in this way to be consistent.

Coding Style
-I applied consistent coding style across all solutions. In short this means grouping together assignments, conditions/loops, and function calls with one another unless a leading comment is above a specific line.