import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">الإعدادات</h2>
        <p className="text-muted-foreground text-sm">إعدادات النظام والتكوين</p>
      </div>
      <div className="bg-card rounded-lg border border-border shadow-sm p-8">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <SettingsIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">إعدادات النظام</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            هذه الصفحة ستتضمن إعدادات النظام العامة، إدارة الأدوار والصلاحيات، وإعدادات الإشعارات.
          </p>
        </div>
      </div>
    </div>
  );
}
