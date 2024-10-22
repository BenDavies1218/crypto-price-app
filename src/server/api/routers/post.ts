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
});
