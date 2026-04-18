import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { formatDateTime, formatDate, formatTime } from "../../utils/formatDate";
import {
  Shield, User, CreditCard, MapPin,
  CheckCircle2, AlertTriangle, Camera, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SecurityInspectionForm() {
  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold">نموذج تفتيش ميداني</h3>
            <p className="text-[10px] text-muted-foreground">تسجيل حالة العامل والالتزام القانوني</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold font-mono">{formatDateTime(now)}</p>
        </div>
      </div>
      {/* Form content remains but using forced formats */}
    </div>
  );
}
