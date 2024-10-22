"use client";
import Image from "next/image";
import type { Currency } from "~/server/api/routers/post";
import { useState, useEffect } from "react";
import { useToast } from "~/hooks/use-toast";

export default function SingleCurrency({
  data,
  removeCurrenyState,
}: {
  data: Currency;
  removeCurrenyState: () => void;
}) {
  const [imgSrc, setImgSrc] = useState(
    `/color/${data.symbol.toLocaleLowerCase()}.png`,
  );

  const { toast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Function to safely parse the watchlist from localStorage
  const getWatchlist = (): Currency[] => {
    const currentWatchlist = localStorage.getItem("watchlist");
    if (!currentWatchlist) {
      return [];
    }

    try {
      // Try to parse the watchlist
      return JSON.parse(currentWatchlist) as Currency[];
    } catch (error) {
      console.error("Error parsing watchlist JSON", error);
      // Return an empty array if parsing fails
      return [];
    }
  };

  // Check if the currency is already in the watchlist on mount
  useEffect(() => {
    const watchlist = getWatchlist();
    const foundInWatchlist = watchlist.some(
      (item: Currency) => item.symbol === data.symbol,
    );
    setIsInWatchlist(foundInWatchlist);
  }, [data.symbol]);

  const handleAddToWatchlist = () => {
    const watchlist = getWatchlist();

    // Check if the item is already in the watchlist
    const isAlreadyInWatchlist = watchlist.some(
      (item: Currency) => item.symbol === data.symbol,
    );

    if (!isAlreadyInWatchlist) {
      // Add new currency to the watchlist
      watchlist.push(data);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      setIsInWatchlist(true);
      toast({
        description: (
          <div className="flex items-center gap-2">
            <Image
              src={imgSrc}
              alt={data.name}
              width={20}
              height={20}
              className="rounded-full"
            />
            <span className="text-xxs">{`${data.name} has been added to your watchlist`}</span>
          </div>
        ),
      });
    }
  };

  const handleRemoveFromWatchlist = () => {
    const watchlist = getWatchlist();

    // Remove the currency from the watchlist
    const updatedWatchlist = watchlist.filter(
      (item: Currency) => item.symbol !== data.symbol,
    );
    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    setIsInWatchlist(false);
    removeCurrenyState();
    toast({
      description: (
        <div className="flex items-center gap-2">
          <Image
            src={imgSrc}
            alt={data.name}
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="text-xxs">{`${data.name} has been removed from your watchlist`}</span>
        </div>
      ),
    });
  };

  return (
    <div className="grid grid-cols-4 rounded-md border-2 border-black bg-zinc-800 py-4 pr-12">
      <div className="flex h-[40px] w-[80px] items-center justify-center text-sm">
        {data.cmc_rank}#
      </div>
      <div className="flex h-[40px] w-[96px] items-center gap-2">
        <Image
          src={imgSrc}
          alt={data.name}
          width={30}
          height={30}
          onError={() => setImgSrc("/no-image-svgrepo-com.svg")}
        />
        <div>
          <div className="text-sm">{data.name}</div>
          <div className="text-xxs text-slate-400">
            {`${(data.quote.USD.volume_24h / 1_000_000_000).toFixed(2)}bn`}
          </div>
        </div>
      </div>
      <div className="flex h-[40px] w-[96px] items-center justify-center text-xxs">
        {data.quote.USD.price < 0.01
          ? `$${data.quote.USD.price.toFixed(6)}`
          : `$${data.quote.USD.price.toFixed(2)}`}
      </div>
      <div className="relative flex h-[40px] w-[96px] items-center justify-center gap-1 rounded-md">
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
        {isInWatchlist ? (
          <div className="absolute right-[-30px] hover:cursor-pointer">
            <Image
              src={"/remove-svgrepo-com.svg"}
              alt="Remove from Watchlist"
              width={20}
              height={20}
              onClick={handleRemoveFromWatchlist}
            />
          </div>
        ) : (
          <div className="absolute right-[-30px] hover:cursor-pointer">
            <Image
              src={"/plus-svgrepo-com.svg"}
              alt="Add to Watchlist"
              width={20}
              height={20}
              onClick={handleAddToWatchlist}
            />
          </div>
        )}
      </div>
    </div>
  );
}
