"use client";

/**
 * Skeleton placeholder components.
 * Renders an animated shimmer in the Airtable design system style.
 */

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className ?? ""}`}
      style={{ background: "linear-gradient(90deg, #f0f2f5 25%, #e4e7ec 50%, #f0f2f5 75%)", backgroundSize: "200% 100%", ...style }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="airtable-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Shimmer className="h-3 w-28" />
        <Shimmer className="w-9 h-9 rounded-full" />
      </div>
      <Shimmer className="h-9 w-24" />
      <Shimmer className="h-3 w-40" />
    </div>
  );
}

export function ModelCardSkeleton() {
  return (
    <div className="airtable-card p-6 flex flex-col gap-5">
      <div>
        <Shimmer className="h-3 w-12 mb-2" />
        <Shimmer className="h-4 w-36" />
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-10" />
        </div>
        <Shimmer className="h-1.5 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: "1px solid #e0e2e6" }}>
        <div><Shimmer className="h-3 w-12 mb-2" /><Shimmer className="h-4 w-16" /></div>
        <div><Shimmer className="h-3 w-16 mb-2" /><Shimmer className="h-4 w-12" /></div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr style={{ borderBottom: "1px solid #e0e2e6" }}>
      <td className="py-4 px-5"><Shimmer className="h-4 w-48" /></td>
      <td className="py-4 px-5"><Shimmer className="h-4 w-64" /></td>
      <td className="py-4 px-5 text-right"><Shimmer className="h-6 w-12 ml-auto" /></td>
    </tr>
  );
}
