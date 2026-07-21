import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import SearchBox from "./SearchBox";

export default function Header() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          ✈️ {SITE_NAME}
        </Link>
        <SearchBox />
      </div>
    </header>
  );
}
