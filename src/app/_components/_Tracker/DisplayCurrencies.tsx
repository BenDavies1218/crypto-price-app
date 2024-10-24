"use client";
import type { Currency } from "~/server/api/routers/post";
import { api } from "~/trpc/react";
import SingleCurrency from "./SingleCurrency";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { useInView } from "react-intersection-observer";

export default function DisplayCurrencies() {
  // State Management
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isActive, setIsActive] = useState<string | null>("#");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [removedCurrencies, setRemovedCurrencies] = useState<boolean>(false);

  // Ref for check if the bottom of the list is in view to fetch more data & search Input
  const { ref, inView } = useInView();
  const refForSearchInput = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, fetchNextPage, isFetchingNextPage } =
    api.post.getInfiniteData.useInfiniteQuery(
      {
        limit: 25, // Amount of data per fetch
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined, // Update the cursor to fetch the next page
      },
    );

  useEffect(() => {
    // Fetch next page if the bottom of the list is in view
    if (inView) {
      void fetchNextPage();
    }

    // Handle click outside for closing the search input
    const handleClickOutside = (event: MouseEvent) => {
      if (
        refForSearchInput.current &&
        !refForSearchInput.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inView, fetchNextPage, refForSearchInput]);

  // Combine all fetched data
  const allCurrencies = data?.pages.flatMap((page) => page.data) ?? [];

  // Filter based on search query
  const filteredCurrencies: Currency[] = allCurrencies.filter(
    (currency: Currency) =>
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort filtered currencies
  const sortedFilteredCurrencies = [...filteredCurrencies].sort((a, b) => {
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
      default:
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

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
      ref={refForSearchInput}
    >
      {/* Search bar and title */}
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

      {/* Display sorted and filtered currencies */}
      {sortedFilteredCurrencies.length > 0 ? (
        sortedFilteredCurrencies.map((currency) => (
          <SingleCurrency
            key={currency.cmc_rank}
            data={currency}
            removeCurrencyState={() => setRemovedCurrencies((prev) => !prev)}
          />
        ))
      ) : searchOpen ? (
        <div className="w-[440px] text-center text-sm text-slate-400">
          No currencies found
        </div>
      ) : (
        /* Display loading state on component mount  */
        [1, 2, 3, 4, 5, 6].map((index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-2 rounded-md border-2 border-black bg-zinc-800 p-4"
          >
            <div className="flex h-[40px] w-[396px] items-center justify-center">
              {index === 1 && (
                <div className="text-sm text-slate-400">
                  Loading Currencies...
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Infinite scroll loader and ref to check when in view */}
      <div ref={ref} className="text-sm text-slate-400">
        {isFetchingNextPage
          ? "Loading more..."
          : "No more data to load."}
      </div>
    </div>
  );
}
