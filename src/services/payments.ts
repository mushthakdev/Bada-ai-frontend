import { api } from "@/lib/api";
import { asList } from "@/lib/utils";
import type { Payment } from "@/types";

export interface PaymentOrder {
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  provider: string;
  is_mock: boolean;
  key_id?: string | null;
  note?: string | null;
}

export interface PaymentVerifyResult {
  status: string;
  payment_id: string;
  campaign_id: string;
  campaign_status: string;
  is_mock: boolean;
  invoice_number?: string;
}

export const paymentService = {
  list: async (business_id?: string) =>
    asList<Payment>((await api.get<unknown>("/payments", { business_id })).data),

  createOrder: async (campaign_id: string) =>
    (await api.post<PaymentOrder>("/payments/orders", { campaign_id })).data,

  verify: async (payload: {
    payment_id: string;
    provider_payment_id?: string;
    provider_signature?: string;
    mock_success?: boolean;
  }) => (await api.post<PaymentVerifyResult>("/payments/verify", payload)).data,
};
