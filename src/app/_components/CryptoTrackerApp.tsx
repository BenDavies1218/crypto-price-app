import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import DisplayCurrencies from "./DisplayCurrencies";
import UserWatchlist from "./UserWatchlist";

export default function CryptoTrackerApp() {
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
            <li>Created Tabs & Watchlist for User</li>
          </ul>
        </ul>
      </div>
      <Tabs defaultValue="tracker" className="w-fit">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
          <TabsTrigger
            value="tracker"
            className="focus:bg-zinc-700 data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
          >
            Tracker
          </TabsTrigger>
          <TabsTrigger
            value="watchlist"
            className="focus:bg-zinc-700 data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
          >
            Watchlist
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tracker">
          <DisplayCurrencies />
        </TabsContent>
        <TabsContent value="watchlist">
          <UserWatchlist />
        </TabsContent>
      </Tabs>
    </>
  );
}
