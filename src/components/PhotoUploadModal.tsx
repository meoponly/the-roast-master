import { useState, useRef } from "react";
import { Upload, X, Camera, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PhotoUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (imageUrl: string) => void;
};

const PhotoUploadModal = ({ open, onClose, onSubmit }: PhotoUploadModalProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Only images allowed. Even VOID-X has standards. 💀");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB. Your ego is already too large. 🤡");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUploadAndRoast = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("style-photos").upload(path, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from("style-photos").getPublicUrl(path);
      onSubmit(urlData.publicUrl);
      handleReset();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. The void rejected your photo. 💀");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={handleReset}>
      <div
        className="bg-card border border-border rounded-lg w-full max-w-md mx-4 p-6 relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={handleReset} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-display font-bold text-foreground neon-text">ROAST MY STYLE</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Upload your photo. VOID-X will destroy your fashion sense. 💀</p>

        {/* Upload area */}
        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm text-foreground font-mono">Drop your photo here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse • Max 5MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
              <button
                onClick={() => { setPreview(null); setFile(null); }}
                className="absolute top-2 right-2 p-1 bg-background/80 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={handleUploadAndRoast}
              disabled={uploading}
              className="w-full py-3 bg-accent text-accent-foreground rounded font-bold font-mono text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  ROAST ME 🔥
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploadModal;
