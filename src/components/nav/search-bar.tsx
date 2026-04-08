"use client";

import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { searchArticles } from "@/app/actions/articles";
import { Input } from "@/components/ui/input";

type SearchResult = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await searchArticles(query);
          setResults(res as SearchResult[]);
          setIsOpen(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full max-w-sm hidden md:flex items-center group"
    >
      <div className="absolute left-2.5 top-2.5 text-muted-foreground group-focus-within:text-primary transition-colors">
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>
      <Input
        type="search"
        placeholder="Search articles..."
        className="w-full pl-9 bg-gray-100/50 hover:bg-gray-100 border-transparent focus:border-border transition-all"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (query.trim().length > 0) setIsOpen(true);
        }}
      />

      {isOpen && results.length > 0 && (
        <div className="absolute top-12 -left-1/2 right-0 z-50 bg-white rounded-md border shadow-lg overflow-hidden flex flex-col max-h-[400px] overflow-y-auto w-[400px]">
          {results.map((article) => (
            <Link
              href={`/wiki/${article.id}`}
              key={article.id}
              className="p-3 hover:bg-gray-100 border-b last:border-0 transition-colors flex flex-col gap-1 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <span className="font-medium text-sm text-gray-900">
                {article.title}
              </span>
              {article.summary && (
                <span className="text-xs text-gray-500 line-clamp-2">
                  {article.summary}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
      {isOpen &&
        results.length === 0 &&
        query.trim().length > 0 &&
        !isSearching && (
          <div className="absolute top-12 left-0 right-0 z-50 bg-white p-4 rounded-md border shadow-lg w-[400px]">
            <span className="text-sm text-gray-500">
              No articles found matching "{query}"
            </span>
          </div>
        )}
    </div>
  );
}
