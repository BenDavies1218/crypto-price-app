"use client";
import Image from "next/image";
import SingleCurrency from "./SingleCurrency";
import { useEffect, useRef, useState } from "react";
import type { Currency } from "~/server/api/routers/post";
import { Input } from "~/components/ui/input";

export default function UserWatchlist() {
  // State Management
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isActive, setIsActive] = useState<string | null>("#");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [removedCurrencies, setRemovedCurrencies] = useState<boolean>(false);

  // Ref for managing click outside of search input & focus on Search input
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use Effect
  useEffect(() => {
    // Fetch and parse the watchlist from localStorage
    const storedWatchlist = localStorage.getItem("watchlist");
    if (storedWatchlist) {
      try {
        const parsedWatchlist = JSON.parse(storedWatchlist) as Currency[];
        setCurrencies(parsedWatchlist);
      } catch (error) {
        console.error("Error parsing watchlist data from localStorage:", error);
      }
    }

    // Handle click outside for closing the search input
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [removedCurrencies, ref]);

  // Functions
  const removeCurrencyState = () => {
    setRemovedCurrencies((prev) => !prev);
  };

  // Create a filtered list of currencies based on the search query
  const filteredCurrencies: Currency[] = Array.isArray(currencies)
    ? currencies.filter((currency: Currency) =>
        currency.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // Sort filtered currencies (what's rendered to the user)
  const sortedFilteredCurrencies = [...filteredCurrencies]?.sort(
    (a: Currency, b: Currency) => {
      let comparison = 0;
      switch (isActive) {
        case "#":
          comparison = a.cmc_rank - b.cmc_rank;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = b.quote.USD.price - a.quote.USD.price;
          break;
        case "percent":
          comparison =
            b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    },
  );

  // Handle the sorting of the currencies
  const handleFilterChange = (filter: string) => {
    if (filter === isActive) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setIsActive(filter);
      setSortDirection("asc");
    }
  };

  // Focus input when search icon is clicked
  const handleSearchIconClick = () => {
    setSearchOpen(!searchOpen);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div
      className="flex max-h-[500px] min-h-[500px] w-[450px] flex-col items-center gap-2 overflow-x-hidden rounded-lg border-2 border-black bg-zinc-900 p-4"
      ref={ref}
    >
      {/* Search bar and title / heading */}
      <div className="flex w-full items-center justify-between px-4">
        {!searchOpen && (
          <>
            <div className="flex flex-col items-start justify-between">
              <div className="text-lg">AssetTracker</div>
              <div className="text-xxs">Track your favourite crypto assets</div>
            </div>
            <Image
              src={"/search-alt-svgrepo-com.svg"}
              alt=""
              width={30}
              height={30}
              onClick={handleSearchIconClick}
              className="hover:cursor-pointer"
            />
          </>
        )}
        {searchOpen && (
          <div className="flex w-full items-center justify-between gap-2">
            <Image
              src={"/search-alt-svgrepo-com.svg"}
              alt=""
              width={30}
              height={30}
              onClick={handleSearchIconClick}
              className="hover:cursor-pointer"
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border-2 border-black bg-zinc-800 p-2"
            />
          </div>
        )}
      </div>

      {/* Filter options */}
      <div className="grid w-[380px] grid-cols-4 rounded-md pr-10 pt-2">
        {["#", "name", "price", "percent"].map((filter) => (
          <div
            key={filter}
            className="flex h-[40px] cursor-pointer items-center justify-center text-xs"
            onClick={() => handleFilterChange(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {isActive === filter && (
              <Image
                src={
                  sortDirection === "asc"
                    ? "/back-svgrepo-com-select.svg"
                    : "/back-svgrepo-com-select-up.svg"
                }
                alt="Sort Arrow"
                width={20}
                height={20}
              />
            )}
          </div>
        ))}
      </div>

      {/* Display currencies or a message if no currencies are found */}
      {sortedFilteredCurrencies.length > 0 ? (
        sortedFilteredCurrencies.map((currency: Currency) => (
          <SingleCurrency
            key={currency.cmc_rank}
            data={currency}
            removeCurrencyState={removeCurrencyState}
          />
        ))
      ) : searchOpen ? (
        <div className="w-[440px] text-center text-xs text-slate-500">
          No currencies found
        </div>
      ) : (
        <div className="w-[440px] text-center text-xs text-slate-500">
          You aren&apos;t watching any coins at the moment
        </div>
      )}
    </div>
  );
}
