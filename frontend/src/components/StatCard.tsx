import { type ElementType } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  iconBg: string;      // e.g. "bg-primary/10"
  iconColor: string;   // e.g. "text-primary"
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend, trendUp }: StatCardProps) {
  return (
    <div className="card p-6 flex items-start justify-between gap-4 hover:border-stroke transition-all duration-200 hover:shadow-card group">
      <div className="space-y-2">
        <p className="text-sm font-medium text-bodydark2">{label}</p>
        <p className="text-3xl font-bold tracking-tight text-bodydark">{value}</p>
        {trend && (
          <p className={`text-xs font-medium ${trendUp ? "text-success" : "text-danger"}`}>
            {trendUp ? "▲" : "▼"} {trend}
          </p>
        )}
      </div>
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconBg} transition-transform group-hover:scale-110`}>
        <Icon size={22} weight="fill" className={iconColor} />
      </div>
    </div>
  );
}
