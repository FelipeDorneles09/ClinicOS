interface SkeletonProps {
  className?: string;
}

function Bone({ className = "" }: SkeletonProps) {
  return <div className={`shimmer rounded-md ${className}`} />;
}

export function SkeletonStat() {
  return (
    <div className="card p-6 flex items-start justify-between gap-4">
      <div className="space-y-3 flex-1">
        <Bone className="h-3 w-28" />
        <Bone className="h-8 w-16" />
        <Bone className="h-2.5 w-20" />
      </div>
      <Bone className="h-12 w-12 rounded-full flex-shrink-0" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="table-header px-5 py-3 border-b border-stroke flex gap-6">
        {[40, 28, 20, 12].map((w, i) => (
          <Bone key={i} className={`h-3 w-${w}`} />
        ))}
      </div>
      <div className="divide-y divide-stroke/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-5 py-4">
            <Bone className="h-4 w-36" />
            <Bone className="h-4 w-24" />
            <Bone className="h-4 w-20" />
            <Bone className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
