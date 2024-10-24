"use client";

import { useEffect } from "react";
import { api } from "~/trpc/react";
import { useInView } from "react-intersection-observer";

// Used this to figure out how to implement infinite scrolling
export default function Page() {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, isFetchingNextPage } =
    api.post.getInfiniteData.useInfiniteQuery(
      {
        limit: 25,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    );

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div className="flex flex-col gap-2">
      {data?.pages.map((page, index) => (
        <div key={index} className="flex flex-col gap-2">
          {page.data.map((item) => (
            <div key={item.name} className="bg-grayscale-700 rounded-md p-4">
              {item.name} - ${item.quote.USD.price.toFixed(2)}
            </div>
          ))}
        </div>
      ))}

      <div ref={ref}>
        {isFetchingNextPage ? "Loading more..." : "No more data to load."}
      </div>
    </div>
  );
}
