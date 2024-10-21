"use client";
import Image from "next/image";
import type { Currency } from "~/server/api/routers/post";

export default function SingleCurrency({ data }: { data: Currency }) {
  return (
    <div className="grid grid-cols-4 rounded-md border-2 border-black bg-zinc-800 p-4">
      <div className="rank flex h-[40px] w-[80px] items-center justify-center">
        {data.cmc_rank}#
      </div>
      <div className="flex h-[40px] w-[96px] items-center gap-2">
        <Image
          src={`/color/${data.symbol.toLocaleLowerCase()}.png`}
          alt={data.name}
          width={30}
          height={30}
        />
        <div>
          <h2 className="text-sm">{data.name}</h2>
          <h5 className="text-xs">
            {`${(data.quote.USD.volume_24h / 1_000_000_000).toFixed(2)}bn`}
          </h5>
        </div>
      </div>
      <div className="flex h-[40px] w-[96px] items-center justify-center">
        {`$${data.quote.USD.price.toFixed(2)}`}
      </div>
      <div className="flex h-[40px] w-[96px] items-center justify-center gap-1 rounded-md">
        <div
          className={`flex items-center justify-center gap-1 rounded-md px-1 ${
            data.quote.USD.percent_change_24h > 0
              ? "bg-green-200"
              : "bg-red-200"
          }`}
        >
          <Image
            src={
              data.quote.USD.percent_change_24h > 0
                ? "/back-svgrepo-com-up-green.svg"
                : "/back-svgrepo-com-down-red.svg"
            }
            alt={
              data.quote.USD.percent_change_24h > 0
                ? "Upward trend"
                : "Downward trend"
            }
            width={20}
            height={20}
          />

          <div
            className={`text-sm ${
              data.quote.USD.percent_change_24h > 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {data.quote.USD.percent_change_24h.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}
