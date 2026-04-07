import { cn } from "@/lib/utils";

type BadgeVariant = "active" | "suspended" | "expired" | "runaway" | "pending" | "paid" | "failed" | "admin" | "officer" | "clerk" | "auditor" | "ministry" | "deported" | "deceased" | "left" | "default";

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-green-500 text-white border-green-600",
  suspended: "bg-yellow-500 text-white border-yellow-600",
  deported: "bg-red-500 text-white border-red-600",
  deceased: "bg-black text-white border-gray-800",
  left: "bg-gray-500 text-white border-gray-600",
  expired: "bg-muted text-muted-foreground border-border",
  runaway: "bg-destructive/15 text-destructive border-destructive/20",
  pending: "bg-warning/15 text-warning border-warning/20",
  paid: "bg-success/15 text-success border-success/20",
  failed: "bg-destructive/15 text-destructive border-destructive/20",
  admin: "bg-primary/15 text-primary border-primary/20",
  officer: "bg-info/15 text-info border-info/20",
  clerk: "bg-accent/15 text-accent border-accent/20",
  auditor: "bg-warning/15 text-warning border-warning/20",
  ministry: "bg-secondary/15 text-secondary border-secondary/20",
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
