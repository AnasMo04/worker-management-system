import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: string;
}

export function KPICard({ title, value, icon, trend, color = "text-primary" }: KPICardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className="text-[10px] font-medium text-muted-foreground">
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-muted ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
