/** Mirrors backend creative_formats_service FORMAT_SPECS for wizard previews. */

export interface CreativeFormatSpec {
  format_key: string;
  label: string;
  aspect_ratio: string;
  orientation: string;
  channels: string[];
  duration_seconds: number;
  safe_zone: string;
  adaptation: string;
}

export const CREATIVE_FORMAT_SPECS: CreativeFormatSpec[] = [
  {
    format_key: "ctv_16x9",
    label: "TV / CTV — 16:9",
    aspect_ratio: "16:9",
    orientation: "landscape",
    channels: ["ctv", "ott"],
    duration_seconds: 30,
    safe_zone: "Keep logo and CTA within central 80% — TV overscan",
    adaptation: "Larger type, slower pacing, end-card with QR",
  },
  {
    format_key: "youtube_landscape",
    label: "YouTube — landscape",
    aspect_ratio: "16:9",
    orientation: "landscape",
    channels: ["youtube"],
    duration_seconds: 20,
    safe_zone: "Leave lower-right clear for YouTube UI chrome",
    adaptation: "Hook in first 5s; captions burned in",
  },
  {
    format_key: "instagram_reel",
    label: "Instagram Reel — 9:16",
    aspect_ratio: "9:16",
    orientation: "portrait",
    channels: ["meta"],
    duration_seconds: 15,
    safe_zone: "Keep CTA above bottom 20% (UI overlays)",
    adaptation: "Vertical reframing with subject-aware composition, not a simple crop",
  },
  {
    format_key: "instagram_story",
    label: "Instagram Story — 9:16",
    aspect_ratio: "9:16",
    orientation: "portrait",
    channels: ["meta"],
    duration_seconds: 10,
    safe_zone: "Top 14% and bottom 20% reserved for system UI",
    adaptation: "Shorter copy, swipe-up style CTA language",
  },
  {
    format_key: "facebook_feed",
    label: "Facebook feed",
    aspect_ratio: "1:1",
    orientation: "square",
    channels: ["meta"],
    duration_seconds: 15,
    safe_zone: "Primary message in centre third",
    adaptation: "Square master with readable captions",
  },
  {
    format_key: "social_image",
    label: "Social feed image",
    aspect_ratio: "1:1",
    orientation: "square",
    channels: ["meta"],
    duration_seconds: 0,
    safe_zone: "Logo bottom-left, offer centre",
    adaptation: "Static key visual derived from brief — not a video frame grab alone",
  },
  {
    format_key: "display_banner",
    label: "Display banner",
    aspect_ratio: "16:9",
    orientation: "landscape",
    channels: ["publishers"],
    duration_seconds: 0,
    safe_zone: "300x250 / 728x90 friendly hierarchy",
    adaptation: "Compressed messaging for banner density",
  },
  {
    format_key: "local_screen",
    label: "Local digital screen",
    aspect_ratio: "16:9",
    orientation: "landscape",
    channels: ["local_screens"],
    duration_seconds: 10,
    safe_zone: "High contrast; large CTA for viewing distance",
    adaptation: "Loop-friendly; QR prominent",
  },
  {
    format_key: "publisher_video",
    label: "Publisher video ad",
    aspect_ratio: "16:9",
    orientation: "landscape",
    channels: ["publishers"],
    duration_seconds: 15,
    safe_zone: "Centre-weighted for in-article players",
    adaptation: "Muted-autoplay ready with captions",
  },
];

export function formatsForChannels(channelCodes: string[]): CreativeFormatSpec[] {
  if (!channelCodes.length) return CREATIVE_FORMAT_SPECS;
  return CREATIVE_FORMAT_SPECS.filter((s) => s.channels.some((c) => channelCodes.includes(c)));
}
