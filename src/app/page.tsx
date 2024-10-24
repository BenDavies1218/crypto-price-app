import { HydrateClient } from "~/trpc/server";
import CryptoTrackerApp from "./_components/CryptoTrackerApp";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#443d4a] to-[#1d1d61] text-white">
        <a href={"https://crypto-price-app-two.vercel.app/"} target="_blank">
          Go to Interview App
        </a>
        <CryptoTrackerApp />
      </main>
    </HydrateClient>
  );
}
