## Build a Bank Integration

### Task

First Plaidypus Bank has approached Plaid and asked if they can be added to our platform.
Unfortunately, they don't have an external API. But that's ok! We can still make this work.

Your task is to build an integration against their public website at firstplaidypus.herokuapp.com.

*Integrations are core to Plaid's business. Thank you for taking the time to complete this test!*

### Getting started

Log into First Plaidypus Bank using the following sets of test credentials:

```
username: user0
password: password

username: user1
password: password

username: user2
password: password
```

Take a look around the site to understand its structure and where data comes from.
Your next step will be to write an 'extractor' that extracts data from the site
into structured JSON that Plaid uses to power its API.

### Requirements

We've provided a TypeScript framework and test runner to use in building your extractor.
Take a look at `src/extract.ts`. This is the test runner for your extractor.
Your extractor code should all live within the `src/extractor` directory, with the
entry point for your extractor being `index.ts`.

`extract.ts` expects your extractor to have the following functions implemented:

```
  login                 // Authenticates your extractor to the financial institution
  extractAccounts       // Returns a list of accounts, and metadata about them
  extractInfo           // Returns account holder information, including names, emails, phone numbers, and addresses
  extractTransactions   // Returns a list of transactions over a specified date range
  README.md             // A description of how your extractor works, edge cases, known issues, etc
```

***Your job is to implement these functions for this take home challenge.***

### Running your extractor

To run the extractor:

```
make setup
make build
make extract
```

Note: You'll need to have Node 8 installed.

The first time you run `make extract` you should see `{ error: { code: 100, description: 'UnsupportedOperation' } }`. This is expected, since `login` is not yet implemented.

Again, your task is to implement `login` and the rest of the required functions. A previous developer stubbed out `login` and made some progress on `extractAccounts` before having to switch to another project. A good first place to start is implementing `login`.

Note: The `extract` test runner has hard coded credentials for `login`, and a hardcoded date range for `transactions`. You should feel free to change those for testing.

Once you've made some changes and want to test your work, you can run the extract script again:

```
make build
make extract
```

You should now receive output that looks similar to `example_output.json`.

You may want to use `make watch` in a separate terminal window in order to run the TypeScript compiler in watch mode. Watch input files and trigger recompilation on changes, removing the need to run `make build` every time you want to test some changes.

We also suggest using `make lint` to run tslint on the `src` directory.

### Evaluation Criteria

Treat this like production code. We will be evaluating you on:

  - **Completeness**: did you complete the required functions?
  - **Correctness**: does the integration return correct & comprehensive data?
  - **Readability**: is the code easy to follow?
  - **Thoroughness**: are edge cases handled correctly? what happens if the site changes after you've shipped your integration?

### Timeline

You should expect to work on this for about 4-6 hours. This is a guideline and if you find you finish sooner or a bit later, don't worry. The test is also not timed so as to be flexible if you need to start and stop. Please return this test within 5 business days.

### Submission

When you're done, please email your recruiter a zip file of your solution - including all the files in the extractor directory.