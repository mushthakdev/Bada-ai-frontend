import { Film } from "lucide-react";
import { MockBadge } from "@/components/ui/data-badge";
import { cn } from "@/lib/utils";

interface CreativePreviewProps {
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  isMock?: boolean;
  headline?: string | null;
  cta?: string | null;
  className?: string;
}

/** 16:9 preview frame. Shows real media when available, otherwise a clearly-labelled placeholder. */
export function CreativePreview({ videoUrl, thumbnailUrl, isMock, headline, cta, className }: CreativePreviewProps) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-xl bg-navy-900", className)}>
      {videoUrl ? (
        <video src={videoUrl} poster={thumbnailUrl ?? undefined} controls className="size-full object-cover" />
      ) : thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnailUrl} alt="Creative thumbnail" className="size-full object-cover" />
      ) : (
        <div className="bg-grid-navy flex size-full flex-col items-center justify-center gap-3 p-6 text-center text-white">
          <Film className="size-8 text-brand-300" aria-hidden />
          {headline ? <p className="font-display text-xl font-semibold">{headline}</p> : <p className="text-sm text-navy-300">No video available for this creative</p>}
          {cta && <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-navy-900">{cta}</span>}
        </div>
      )}
      {isMock && (
        <div className="absolute left-3 top-3">
          <MockBadge />
        </div>
      )}
    </div>
  );
}
