import { cn } from "@/lib/utils";

type BadgeVariant = "active" | "suspended" | "expired" | "runaway" | "pending" | "paid" | "failed" | "admin" | "officer" | "clerk" | "auditor" | "ministry" | "deported" | "deceased" | "left" | "default";

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-green-500/10 text-green-600 border-green-200",
  suspended: "bg-amber-500/10 text-amber-600 border-amber-200",
  deported: "bg-red-500/10 text-red-600 border-red-200",
  deceased: "bg-gray-900/10 text-gray-900 border-gray-300",
  left: "bg-slate-500/10 text-slate-600 border-slate-200",
  expired: "bg-muted text-muted-foreground border-border",
  runaway: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  paid: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  admin: "bg-primary/10 text-primary border-primary/20",
  officer: "bg-info/10 text-info border-info/20",
  clerk: "bg-accent/10 text-accent border-accent/20",
  auditor: "bg-warning/10 text-warning border-warning/20",
  ministry: "bg-secondary/10 text-secondary border-secondary/20",
  default: "bg-muted text-muted-foreground border-border",
};

const arabicLabels: Record<string, string> = {
  active: "نشط",
  suspended: "موقوف",
  deported: "مرحّل",
  deceased: "متوفى",
  left: "خارج البلاد",
  expired: "منتهي",
  runaway: "هارب",
  pending: "قيد الانتظار",
  paid: "مدفوع",
  failed: "فشل",
  admin: "مدير",
  officer: "ضابط",
  clerk: "موظف",
  auditor: "مراجع",
  ministry: "وزارة",
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
        variantStyles[variant] || variantStyles.default,
        className
      )}
    >
      {label || arabicLabels[variant] || variant}
    </span>
  );
}
