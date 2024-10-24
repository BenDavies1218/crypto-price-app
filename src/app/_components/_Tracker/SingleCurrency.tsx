"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Currency } from "~/server/api/routers/post";
import { useToast } from "~/hooks/use-toast";
import ImageWithFallback from "../NextImageWithFallback";

export default function SingleCurrency({
  data,
  removeCurrencyState,
}: {
  data: Currency;
  removeCurrencyState: () => void;
}) {
  const { toast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Utility function to get the watchlist from localStorage
  const getWatchlist = (): Currency[] => {
    const currentWatchlist = localStorage.getItem("watchlist");
    if (!currentWatchlist) return [];
    try {
      return JSON.parse(currentWatchlist) as Currency[];
    } catch (error) {
      console.error("Error parsing watchlist JSON:", error);
      return [];
    }
  };

  // Check if currency is in watchlist on mount
  useEffect(() => {
    const watchlist = getWatchlist();
    const foundInWatchlist = watchlist.some(
      (item) => item.symbol === data.symbol,
    );
    setIsInWatchlist(foundInWatchlist);
  }, [data.symbol]);

  // Helper to show toast notifications
  const showToast = useCallback(
    (message: string) => {
      toast({
        description: (
          <div className="flex items-center gap-2">
            <ImageWithFallback
              alt={data.name}
              height={20}
              width={20}
              src={`/color/${data.symbol.toLowerCase()}.png`}
              className="rounded-full"
            />
            <span className="text-xxs">{message}</span>
          </div>
        ),
      });
    },
    [data.name, data.symbol, toast],
  );

  // Add currency to watchlist
  const handleAddToWatchlist = useCallback(() => {
    const watchlist = getWatchlist();
    const isAlreadyInWatchlist = watchlist.some(
      (item) => item.symbol === data.symbol,
    );

    if (!isAlreadyInWatchlist) {
      watchlist.push(data);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      setIsInWatchlist(true);
      showToast(`${data.name} has been added to your watchlist`);
    }
  }, [data, showToast]);

  // Remove currency from watchlist
  const handleRemoveFromWatchlist = useCallback(() => {
    const watchlist = getWatchlist();
    const updatedWatchlist = watchlist.filter(
      (item) => item.symbol !== data.symbol,
    );
    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    setIsInWatchlist(false);
    removeCurrencyState();
    showToast(`${data.name} has been removed from your watchlist`);
  }, [data, removeCurrencyState, showToast]);

  // Format volume for display
  const formatVolume = (volume: number) => {
    return volume < 500_000_000
      ? `${(volume / 1_000_000).toFixed(2)}m`
      : `${(volume / 1_000_000_000).toFixed(2)}bn`;
  };

  return (
    <div className="grid grid-cols-4 rounded-md border-2 border-black bg-zinc-800 py-4 pr-12">
      <div className="flex h-[40px] w-[80px] items-center justify-center text-sm">
        {data.cmc_rank}#
      </div>
      <div className="flex h-[40px] w-[96px] items-center gap-2">
        <ImageWithFallback
          alt={data.name}
          height={20}
          width={20}
          src={`/color/${data.symbol.toLowerCase()}.png`}
        />
        <div>
          <div className="text-xxs">{data.name}</div>
          <div className="text-xxs text-slate-400">
            {formatVolume(data.quote.USD.volume_24h)}
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
        <div className="absolute right-[-30px] hover:cursor-pointer">
          <Image
            src={
              isInWatchlist
                ? "/remove-svgrepo-com.svg"
                : "/plus-svgrepo-com.svg"
            }
            alt={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            width={20}
            height={20}
            onClick={
              isInWatchlist ? handleRemoveFromWatchlist : handleAddToWatchlist
            }
          />
        </div>
      </div>
    </div>
  );
}
