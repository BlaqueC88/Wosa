import { Skeleton } from "~/components/ui/skeleton";

export function MenuItemCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-16" />
        </div>

        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />

        <Skeleton className="mt-5 h-4 w-24" />
      </div>
    </article>
  );
}