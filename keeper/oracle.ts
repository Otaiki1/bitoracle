// keeper/oracle.ts
import { PriceServiceConnection } from '@pythnetwork/price-service-client';

const BTC_USD_FEED_ID = '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43';

const pythConnection = new PriceServiceConnection(
  'https://hermes.pyth.network'
);

export async function getBTCPrice(): Promise<{
  price: bigint;
  confidence: bigint;
  publishTime: number;
}> {
  const priceFeeds = await pythConnection.getLatestPriceFeeds([BTC_USD_FEED_ID]);

  if (!priceFeeds || priceFeeds.length === 0) {
    throw new Error('Failed to fetch BTC price from Pyth');
  }

  const feed = priceFeeds[0];
  const price = feed.getPriceUnchecked();

  // Normalize to 8 decimal places (Pyth may use different exponent)
  const normalizedPrice = BigInt(price.price) * BigInt(10 ** (8 + price.expo));

  return {
    price: normalizedPrice,
    confidence: BigInt(price.conf),
    publishTime: price.publishTime,
  };
}
