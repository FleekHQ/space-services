import { APIGatewayProxyResult, APIGatewayProxyEventBase } from 'aws-lambda';
import createDbModel from '@packages/models/dist/billing/dbModel';
import { Client } from 'coinbase';
import { accountResponse } from '../utils/responses';

if (!process?.env?.ENV) {
  throw new Error('ENV variable not set');
}

const STAGE = process.env.ENV;
const dbModel = createDbModel(STAGE);
const coinbaseClient = new Client({});

interface ExchangeRatesData {
  currency: string;
  rates: Record<string, string>;
}

const getExchangeRates = (currency: string): Promise<ExchangeRatesData> =>
  new Promise((resolve, reject) => {
    coinbaseClient.getExchangeRates({ currency }, function(err, response) {
      if (err) {
        reject(err);
      } else {
        resolve(response.data as ExchangeRatesData);
      }
    });
  });

export interface AuthContext {
  uuid: string;
  pubkey: string;
}

interface GetPaymentDetailsPayload {
  currency: string;
  address: string;
  usdValue: number;
}

// eslint-disable-next-line
export const handler = async (
  event: APIGatewayProxyEventBase<AuthContext>
): Promise<APIGatewayProxyResult> => {
  const { uuid } = event.requestContext.authorizer;
  const account = await dbModel.getOrCreateAccount(uuid);

  const payload: GetPaymentDetailsPayload = JSON.parse(event.body);

  let amountToSend;

  try {
    const data = await getExchangeRates(payload.currency);
    amountToSend = Number(payload.usdValue) / (1.05 * Number(data.rates.USD));
  } catch (e) {
    return {
      statusCode: 400,
      body: 'Invalid request',
    };
  }

  try {
    await dbModel.getWallet(payload.address, payload.currency);
  } catch (e) {
    await dbModel.addWallet({
      ...payload,
      accountId: account.id,
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      amountToSend,
      address: '0x0000',
    }),
  };
};
