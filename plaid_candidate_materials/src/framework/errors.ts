import { ErrorResult } from './plugin';

// ExtractorErrorCodes represent a standardized set of error conditions the
// extractor can express to the framework. If you encounter a new condition not
// expressed here already, add it here and build logic for the framework to
// handle it in extract.ts.
export enum ExtractorErrorCode {
  // Use for unimplemented products only.
  UnsupportedOperation = 100,
  // Reserved by the framework.
  UnexpectedThrownError,

  // Login
  InvalidCredentials = 200,

  // Account configuration
  AccountLocked = 300,

  // Institution errors.
  InstitutionNotResponding = 400,
  InstitutionRequestError,
}

export const errorResult = (
  code: ExtractorErrorCode,
  object?: Error,
): ErrorResult => ({
  error: {
    code,
    description: ExtractorErrorCode[code],
    ...object != null ? { object } : {},
  },
});

const isErrorResult = (value: any): value is ErrorResult =>
  value.error != null &&
  value.error.code != null &&
  ExtractorErrorCode[value.error.code] != null;

// convertThrownValue will coerce a value into an UnexpectedThrownError
// ErrorResult if it is not already an ErrorResult. This function can be
// used in a try/catch block to ensure only ErrorResults are returned.
export const convertThrownValue = (
  error: Error | ErrorResult | any,
): ErrorResult => {
  if (error instanceof Error) {
    return errorResult(
      ExtractorErrorCode.UnexpectedThrownError,
      error,
    );
  }
  if (isErrorResult(error)) {
    return error;
  }
  return errorResult(
    ExtractorErrorCode.UnexpectedThrownError,
    new Error('Extractor threw a value that was not an Error or ErrorResult'),
  );
};
