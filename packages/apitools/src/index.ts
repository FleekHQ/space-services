import { APIGatewayProxyResult } from 'aws-lambda';

interface ProcessRequestOpts {
  successCode?: number;
  errorCode?: number;
}

interface ErrorToStatusCodeInterface {
  [key: string]: number;
}

const mapErrorToStatusCode: ErrorToStatusCodeInterface = {
  ValidationError: 422,
  NotFoundError: 404,
  Error: 500,
};

const getErrorMessage = (err: Error): string => {
  // If the error is a validation error, we return its message
  if (err.name === 'ValidationError' || err.name === 'NotFoundError') {
    return err.message;
  }

  // We obfuscate it otherwise
  return 'Unexpected server error';
};

const DEFAULT_ERROR_CODE = 500;
const DEFAULT_SUCCESS_CODE = 200;

export const renderError = (
  err: Error,
  statusCode: number | undefined
): APIGatewayProxyResult => {
  let sc = statusCode;

  if (!sc) {
    sc = mapErrorToStatusCode[err.name] || DEFAULT_ERROR_CODE;
  }
  return {
    statusCode: sc,
    body: JSON.stringify(
      {
        message: getErrorMessage(err),
      },
      null,
      2
    ),
  };
};

export const renderSuccess = (
  response: object,
  statusCode: number = DEFAULT_SUCCESS_CODE
): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify(response, null, 2),
  };
};

export const processRequest = async (
  requestFn: Function,
  opts: ProcessRequestOpts = {}
): Promise<APIGatewayProxyResult> => {
  let result;
  try {
    result = await requestFn();
  } catch (err) {
    console.error('Error when processing request: ', err.message);
    console.error(err.stack);
    return renderError(err, opts.errorCode);
  }

  return renderSuccess(result, opts.successCode);
};
