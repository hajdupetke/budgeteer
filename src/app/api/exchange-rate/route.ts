import { db } from '@/lib/db';
import { Currency, Prisma } from '@prisma/client';

export async function GET() {
  // Get current exchange rates in an object

  const res = await fetch(
    'https://api.fxratesapi.com/latest?base=EUR&currencies=HUF,USD'
  );

  const data = await res.json();
  console.log(data.rates);

  // Loop through object keys and values and create or update a record with new data

  for (const [currency, exchangeRate] of Object.entries(data.rates)) {
    console.log(currency, exchangeRate);
    const currencyWithType = currency as Currency;
    await db.exchangeRate.upsert({
      where: { currency: currency as Currency },
      create: {
        exchangeRate: new Prisma.Decimal(exchangeRate as Prisma.Decimal.Value),
        currency: currency as Currency,
      },
      update: {
        exchangeRate: new Prisma.Decimal(exchangeRate as Prisma.Decimal.Value),
      },
    });

    console.log(currency as Currency);
  }
  return Response.json({ status: 'ok' });
}
