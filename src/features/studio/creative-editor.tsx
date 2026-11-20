"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input, Textarea } from "@/components/ui/input";
import { MockBadge } from "@/components/ui/data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { errorMessage } from "@/lib/api";
import { aiService } from "@/services/ai";
import type { Creative } from "@/types";

const schema = z.object({
  title: z.string().min(2),
  text_overlay: z.string(),
  voiceover_text: z.string(),
  duration_seconds: z.number().min(1).max(30),
});
type Values = z.infer<typeof schema>;

function SceneEditor({ creative }: { creative: Creative }) {
  const queryClient = useQueryClient();
  const scenes = creative.scenes || [];
  const first = scenes[0];

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: first?.title || creative.title,
      text_overlay: first?.text_overlay || "",
      voiceover_text: first?.voiceover_text || creative.voiceover_script || "",
      duration_seconds: first?.duration_seconds || 5,
    },
  });

  const save = useMutation({
    mutationFn: async (v: Values) => {
      if (!first?.id) throw new Error("No scene to edit");
      return aiService.updateScene(creative.id, first.id, {
        title: v.title,
        text_overlay: v.text_overlay,
        voiceover_text: v.voiceover_text,
        duration_seconds: v.duration_seconds,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["creative", creative.id] });
      toast.success("Scene saved");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Scene editor</CardTitle>
          <div className="flex gap-2">
            <StatusBadge status={creative.status} />
            {creative.is_mock && <MockBadge />}
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => save.mutate(v))}>
            <FormField label="Scene title" htmlFor="scene-title">
              <Input id="scene-title" {...form.register("title")} />
            </FormField>
            <FormField label="Text overlay" htmlFor="scene-overlay">
              <Input id="scene-overlay" {...form.register("text_overlay")} />
            </FormField>
            <FormField label="Voice-over" htmlFor="scene-vo">
              <Textarea id="scene-vo" rows={4} {...form.register("voiceover_text")} />
            </FormField>
            <FormField label="Duration (seconds)" htmlFor="scene-duration">
              <Input
                id="scene-duration"
                type="number"
                step="0.5"
                {...form.register("duration_seconds", { valueAsNumber: true })}
              />
            </FormField>
            <Button type="submit" loading={save.isPending} disabled={!first}>
              Save scene
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {scenes.length === 0 && (
            <p className="text-sm text-navy-500">No scenes on this creative yet.</p>
          )}
          {scenes.map((scene) => (
            <div key={scene.id} className="rounded-lg border border-line px-3 py-2 text-sm">
              <p className="font-medium text-navy-900">
                {scene.order_index}. {scene.title}
              </p>
              <p className="text-navy-500">{scene.duration_seconds}s · {scene.text_overlay || "No overlay"}</p>
            </div>
          ))}
          <p className="pt-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {creative.is_mock
              ? "This creative is mock-generated. Connect a video provider for real rendered ads."
              : "Creative ready for review."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function CreativeEditor({ creativeId }: { creativeId: string }) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["creative", creativeId],
    queryFn: () => aiService.creative(creativeId),
  });

  if (isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (isError || !data) {
    return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title={data.title}
        description="Edit scenes, overlays, and voice-over. Autosave drafts via the API."
        backHref={data.campaign_id ? `/studio/${data.campaign_id}` : "/creatives"}
        backLabel="Back"
      />
      <SceneEditor creative={data} />
    </div>
  );
}
