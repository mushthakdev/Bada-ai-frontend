import { api } from "@/lib/api";
import type { MediaAsset } from "@/types";

export const mediaService = {
  upload: async (file: File, opts: { business_id?: string; category?: string } = {}) => {
    const form = new FormData();
    form.append("file", file);
    if (opts.business_id) form.append("business_id", opts.business_id);
    if (opts.category) form.append("category", opts.category);
    return (await api.upload<MediaAsset>("/media/upload", form)).data;
  },
};
