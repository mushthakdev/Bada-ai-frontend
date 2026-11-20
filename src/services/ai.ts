import { api } from "@/lib/api";
import { asList } from "@/lib/utils";
import type { Creative } from "@/types";

export interface AiPlanResult {
  generation_id: string;
  status: string;
  is_mock: boolean;
  provider: string;
  plan: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface AiGenerateResult {
  generation_id: string;
  creative_id: string;
  status: string;
  is_mock: boolean;
  generation_mode: string;
  note: string;
  creative: Creative;
  preview: Record<string, unknown>;
}

export interface AssistantAction {
  type: string;
  label: string;
  href: string;
}

export interface AssistantSelectOption {
  value: string;
  label: string;
  description?: string | null;
}

export interface AssistantSelect {
  id: string;
  mode: "single" | "multi";
  title: string;
  submit_label?: string;
  select_all?: boolean;
  allow_skip?: boolean;
  allow_custom?: boolean;
  custom_placeholder?: string;
  options: AssistantSelectOption[];
}

export interface AssistantResult {
  conversation_id: string;
  reply: string;
  actions?: AssistantAction[];
  suggestions?: string[];
  select?: AssistantSelect | null;
  tool_results?: Array<Record<string, unknown>>;
  data_quality: { is_simulated: boolean; label: string };
  is_mock_llm: boolean;
  provider?: string;
}

export const aiService = {
  plan: async (payload: { campaign_id: string; brief?: string }) =>
    (await api.post<AiPlanResult>("/ai/plan", payload)).data,

  generate: async (payload: { campaign_id: string; duration?: number }) =>
    (await api.post<AiGenerateResult>("/ai/generate", payload)).data,

  generation: async (id: string) =>
    (
      await api.get<{
        id: string;
        status: string;
        generation_type: string;
        provider: string;
        is_mock: boolean;
        result_json: string | null;
        error_message: string | null;
      }>(`/ai/generations/${id}`)
    ).data,

  translate: async (text: string, target_language: string) =>
    (await api.post<Record<string, unknown>>("/ai/translate", { text, target_language })).data,

  assistant: async (payload: {
    message: string;
    business_id?: string;
    conversation_id?: string;
  }) => (await api.post<AssistantResult>("/ai/assistant", payload)).data,

  creatives: async (params: { campaign_id?: string; business_id?: string } = {}) =>
    asList<Creative>((await api.get<unknown>("/ai/creatives", { ...params })).data),

  creative: async (id: string) => (await api.get<Creative>(`/ai/creatives/${id}`)).data,

  updateScene: async (
    creativeId: string,
    sceneId: string,
    input: Record<string, unknown>,
  ) => (await api.patch<Creative>(`/ai/creatives/${creativeId}/scenes/${sceneId}`, input)).data,
};
