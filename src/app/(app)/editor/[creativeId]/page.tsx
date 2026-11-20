"use client";

import { useParams } from "next/navigation";
import { CreativeEditor } from "@/features/studio/creative-editor";

export default function EditorPage() {
  const { creativeId } = useParams<{ creativeId: string }>();
  return <CreativeEditor creativeId={creativeId} />;
}
