import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  gradient: string;
  change?: string;
}

export function KPICard({ title, value, icon, gradient, change }: KPICardProps) {
  return (
    <div className={`${gradient} rounded-lg p-5 text-primary-foreground shadow-md animate-fade-in`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-85 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value.toLocaleString("ar-LY")}</p>
          {change && <p className="text-xs mt-1 opacity-75">{change}</p>}
        </div>
        <div className="opacity-80 text-3xl">{icon}</div>
      </div>
    </div>
  );
}
