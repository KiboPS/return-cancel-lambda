import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Configuration } from '@kibocommerce/rest-sdk';
import { ReturnApi } from '@kibocommerce/rest-sdk/clients/Commerce'

export const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const FILTER = createFilterString();

  const configuration = Configuration.fromEnv()
  const returnsRescource = new ReturnApi(configuration)

  try {

    const returns = await returnsRescource.getReturns({ pageSize: 200, filter: FILTER});
console.log("returns.totalCount", returns.totalCount)
    const cancelledReturns: string[] = [];

    if (returns.items) {
      const frenchReturns: string[] = returns.items.filter(r => r.siteId == 51354).map(r => r.id!)
      const englishReturns: string[] = returns.items.filter(r => r.siteId == 51353).map(r => r.id!)
console.log({frenchReturns, englishReturns})
      // if(frenchReturns.length > 0) {
      //    const cancelledFrenchReturns =  await returnsRescource.performReturnActions({returnAction: {actionName: "Close", returnIds: frenchReturns}}, adjustSiteHeader(51354));
      //    const cancelledIDs = cancelledFrenchReturns.items?.map(returns => returns.id!) || []
      //    cancelledReturns.concat(cancelledIDs)

      // }

      // if(englishReturns.length > 0) {
      //   const cancelledEnglishReturns = await returnsRescource.performReturnActions({returnAction: {actionName: "Close", returnIds: englishReturns}}, adjustSiteHeader(51353));
      //   const cancelledIDs = cancelledEnglishReturns.items?.map(returns => returns.id!) || []
      //   cancelledReturns.concat(cancelledIDs)
      // }
  
      console.log(`FILTER - ${FILTER} || CLOSED RETURNS - ${JSON.stringify(cancelledReturns)}`);
    }
  } catch (e) {
    console.error(e)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Function executed successfully!',
    }),
  };

};

const createFilterString = () => {
  return `status ne Closed and status ne Cancelled and createDate lt ${getModifiedTime()}`;
}

const getModifiedTime = () => { 
  // TODO: Create dynamic timestamp from variable
  const INTERVAL = process.env.ORDER_AUTO_CANCEL_AGE || 172800000; // default 2 days
  const currentTime = Date.now();
  const modifiedTime = currentTime - Number(INTERVAL);
  const isoTime = new Date(modifiedTime).toISOString();

  return `2024-03-31T00:00:00.000Z`;
}

const adjustSiteHeader = (site: number) => {
  return (incomingOptions: any) => {
    incomingOptions.init.headers['x-vol-site'] = `${site}`

    return incomingOptions.init
  }
}
