import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export type Currency = {
  name: string;
  symbol: string;
  cmc_rank: number;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      percent_change_24h: number;
    };
  };
};

export const postRouter = createTRPCRouter({
  getData: publicProcedure.query(async () => {
    try {
      const response = await fetch(
        "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=25",
        {
          headers: {
            "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY ?? "",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = (await response.json()) as { data: Currency[] };

      const serializedData: Currency[] = data.data.map(
        (currency: Currency) => ({
          name: currency.name,
          symbol: currency.symbol,
          cmc_rank: currency.cmc_rank,
          quote: {
            USD: {
              price: currency.quote.USD.price,
              volume_24h: currency.quote.USD.volume_24h,
              percent_change_24h: currency.quote.USD.percent_change_24h,
            },
          },
        }),
      );

      return serializedData;
    } catch (error) {
      console.error(error);
      return { error: { message: "Failed to fetch data" } };
    }
  }),
  getInfiniteData: publicProcedure
    .input(
      z.object({
        cursor: z.number().nullish(), // cursor instead of page
        limit: z.number().min(1).max(100).default(25),
      }),
    )
    .query(async ({ input }) => {
      try {
        const { cursor, limit } = input;
        const start = cursor ?? 1; // Default start is 1 if no cursor

        const response = await fetch(
          `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${limit}`,
          {
            headers: {
              "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY ?? "",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = (await response.json()) as { data: Currency[] };

        const serializedData: Currency[] = data.data.map(
          (currency: Currency) => ({
            name: currency.name,
            symbol: currency.symbol,
            cmc_rank: currency.cmc_rank,
            quote: {
              USD: {
                price: currency.quote.USD.price,
                volume_24h: currency.quote.USD.volume_24h,
                percent_change_24h: currency.quote.USD.percent_change_24h,
              },
            },
          }),
        );

        const nextCursor = start + limit; // Move cursor forward

        return {
          data: serializedData,
          nextCursor: serializedData.length === limit ? nextCursor : undefined, // If the result is less than limit, no more pages
        };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch data");
      }
    }),
});
