import { HydrateClient } from "~/trpc/server";
import { DisplayCurrencies } from "./_components/DisplayCurrencies";
import { Suspense } from "react";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#443d4a] to-[#1d1d61] text-white">
        <Suspense fallback={<div>Loading...</div>}>
          <DisplayCurrencies />
        </Suspense>
      </main>
    </HydrateClient>
  );
}
