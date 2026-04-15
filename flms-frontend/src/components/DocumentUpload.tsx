import { useState, useRef } from "react";
import { Upload, X, FileText, Image, Eye } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface UploadedDoc {
  name: string;
  type: string;
  url: string;
  label: string;
  file?: File;
}

interface DocumentUploadProps {
  label: string;
  required?: boolean;
  accept?: string;
  value: UploadedDoc | null;
  onChange: (doc: UploadedDoc | null) => void;
}

export function DocumentUpload({ label, required, accept = "image/*,.pdf", value, onChange }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ name: file.name, type: file.type, url, label, file });
  };

  const isImage = value?.type?.startsWith("image/");

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Upload className="w-5 h-5" />
          <span className="text-xs">اضغط لرفع الملف</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {isImage ? <Image className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{value.name}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
          {isImage && (
            <button type="button" onClick={() => setPreview(true)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={() => onChange(null)} className="w-7 h-7 rounded-md bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />

      {isImage && value && (
        <Dialog open={preview} onOpenChange={setPreview}>
          <DialogContent className="max-w-sm p-2">
            <img src={value.url} alt={value.name} className="w-full rounded-lg" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
