// keeper/oracle.ts
const BTC_USD_FEED_ID = '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43';

export async function getBTCPrice(): Promise<{
  price: bigint;
  confidence: bigint;
  publishTime: number;
}> {
  const url = `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${BTC_USD_FEED_ID}&parsed=true`;
  const res = await fetch(url);
  const data: any = await res.json();

  if (!data || !data.parsed || data.parsed.length === 0) {
    throw new Error('Failed to fetch BTC price from Pyth Hermes');
  }

  const priceData = data.parsed[0].price;
  
  // Normalize to 8 decimal places (satoshi precision)
  const normalizedPrice = BigInt(priceData.price) * BigInt(10 ** (8 + priceData.expo));
  
  return {
    price: normalizedPrice,
    confidence: BigInt(priceData.conf),
    publishTime: priceData.publish_time,
  };
}
