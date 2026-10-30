import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { searchMenuItems, type MenuItem } from "~/lib/api";
import { categoryInfo } from "~/lib/categories";
import { formatZAR } from "~/lib/format";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const [results, setResults] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    let isCurrent = true;

    async function runSearch() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await searchMenuItems(query);

        if (isCurrent) {
          setResults(data);
        }
      } catch (error) {
        if (isCurrent) {
          setError(
            error instanceof Error ? error.message : "Unable to search."
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void runSearch();

    return () => {
      isCurrent = false;
    };
  }, [query]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        Search
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        {query.length >= 2 ? `Results for "${query}"` : "Search the menu"}
      </h1>

      {query.length < 2 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Type at least two letters in the search box.
        </p>
      ) : isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Searching...</p>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          No dishes matched your search.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => (
            <Link
              key={item.id}
              to={`/${item.category}/${item.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {categoryInfo[item.category].label}
                </p>

                <div className="mt-1 flex items-start justify-between gap-4">
                  <h2 className="text-lg font-bold">{item.name}</h2>

                  <span className="whitespace-nowrap font-bold text-primary">
                    {formatZAR(item.priceCents)}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
