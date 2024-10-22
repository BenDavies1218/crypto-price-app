"use client";
import type { Currency } from "~/server/api/routers/post";
import { api } from "~/trpc/react";
import SingleCurrency from "./SingleCurrency";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/input";

export function DisplayCurrencies() {
  // Fetch currencies data
  // const [currencies] = api.post.getData.useSuspenseQuery();
  const { data: currencies } = api.post.getData.useQuery();

  // Close search bar when clicking outside of it using a ref
  const ref = useRef<HTMLDivElement>(null);

  // Close search bar when clicking outside of it using a ref add an event the to page to check if the user clicks outside of app
  useEffect(() => {
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
  }, [ref]);

  // Sort direction state and active filter state
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isActive, setIsActive] = useState<string | null>("#");

  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // search Open and close State
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // Create a filtered list of currencies based on the search query
  const filteredCurrencies: Currency[] = Array.isArray(currencies)
    ? currencies.filter((currency: Currency) =>
        currency.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // Sort filtered currencies this is whats rendered to the user
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
          comparison = a.quote.USD.price - b.quote.USD.price;
          break;
        case "percent":
          comparison =
            a.quote.USD.percent_change_24h - b.quote.USD.percent_change_24h;
          break;
        default:
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    },
  );

  const handleFilterChange = (filter: string) => {
    if (filter === isActive) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setIsActive(filter);
      setSortDirection("asc");
    }
  };

  return (
    <>
      <div className="absolute left-8 top-20 text-2xl text-slate-300">
        Updates
        <ul className="list-disc pl-5 pt-6 text-base">
          <strong>Styling</strong>
          <ul className="list-disc pl-5">
            <li>Added Loading text / skeleton</li>
            <li>Styled Search Icon / Input</li>
            <li>Changed text sizing / colors</li>
            <li></li>
          </ul>
        </ul>
        <ul className="list-disc pl-5 pt-6 text-base">
          <strong>Functional</strong>
          <ul className="list-disc pl-5">
            <li>Increase in starting search data</li>
            <li>Displays numbers less than zero</li>
            <li></li>
          </ul>
        </ul>
      </div>
      <div
        className="mt-12 flex max-h-[600px] min-h-[600px] min-w-[455px] flex-col items-center gap-2 overflow-x-hidden rounded-lg border-2 border-black bg-zinc-900 p-4"
        ref={ref}
      >
        {/* Search bar and title / heading */}
        <div className="flex w-full items-center justify-between px-4">
          {!searchOpen && (
            <>
              <div className="flex flex-col items-start justify-between">
                <div className="text-lg">AssetTracker</div>
                <div className="text-xxs">
                  Track your favourite crypto assets
                </div>
              </div>
              <Image
                src={"/search-alt-svgrepo-com.svg"}
                alt=""
                width={30}
                height={30}
                onClick={() => setSearchOpen(!searchOpen)}
                className="hover:cursor-pointer"
              ></Image>
            </>
          )}
          {searchOpen && (
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border-2 border-black bg-zinc-800 p-2"
            />
          )}
        </div>
        {/* Display the filter options (The heading ) */}
        <div className="grid w-full grid-cols-4 rounded-md pt-2">
          {["#", "name", "price", "percent"].map((filter) => (
            <div
              key={filter}
              className="flex h-[40px] cursor-pointer items-center justify-center text-sm"
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
                  alt="select Arrow"
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
            <SingleCurrency key={currency.cmc_rank} data={currency} />
          ))
        ) : searchOpen ? (
          <div>No currencies found</div>
        ) : (
          <>
            {([1, 2, 3, 4, 5, 6] as const).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-2 rounded-md border-2 border-black bg-zinc-800 p-4"
              >
                <div className="flex h-[40px] w-[386px] items-center justify-center">
                  {index === 0 && <div>Loading Currencies...</div>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
