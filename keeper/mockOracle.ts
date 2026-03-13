// keeper/mockOracle.ts
export async function getMockBTCPrice(): Promise<bigint> {
    const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
    const data: any = await res.json();
    const price = parseFloat(data.data.amount);
    // Convert to 8 decimal integer (satoshi precision)
    return BigInt(Math.round(price * 1e8));
  }
