export default function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-gradient-to-r from-white/5 via-white/10 to-white/5 skeleton-shimmer" />
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 bg-white/10 rounded-full skeleton-shimmer" />
        <div className="h-4 w-full bg-white/10 rounded-lg skeleton-shimmer" />
        <div className="h-4 w-3/4 bg-white/10 rounded-lg skeleton-shimmer" />
        <div className="h-3 w-full bg-white/5 rounded-lg skeleton-shimmer" />
        <div className="h-3 w-2/3 bg-white/5 rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonSection() {
  return (
    <div className="mb-10">
      {/* Section header skeleton */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 skeleton-shimmer" />
          <div className="h-5 w-32 bg-white/10 rounded-lg skeleton-shimmer" />
          <div className="h-5 w-8 bg-white/5 rounded-full skeleton-shimmer" />
        </div>
        <div className="h-4 w-16 bg-white/5 rounded-lg skeleton-shimmer" />
      </div>
      <SkeletonGrid count={4} />
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/60 via-violet-900/60 to-purple-900/60 p-8 mb-8 border border-white/10">
      <div className="space-y-4 max-w-md">
        <div className="h-3 w-32 bg-white/10 rounded-full skeleton-shimmer" />
        <div className="h-10 w-64 bg-white/10 rounded-xl skeleton-shimmer" />
        <div className="h-10 w-48 bg-white/10 rounded-xl skeleton-shimmer" />
        <div className="h-4 w-80 bg-white/5 rounded-lg skeleton-shimmer" />
        <div className="h-4 w-64 bg-white/5 rounded-lg skeleton-shimmer" />
        <div className="flex gap-3 pt-2">
          <div className="h-9 w-28 bg-white/10 rounded-xl skeleton-shimmer" />
          <div className="h-9 w-28 bg-white/10 rounded-xl skeleton-shimmer" />
          <div className="h-9 w-24 bg-white/10 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function InfiniteLoadingBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 infinite-bar" />
    </div>
  );
}
