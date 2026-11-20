import { redirect } from "next/navigation";

/** Spec route alias — integrations live at /integrations */
export default function DashboardIntegrationsAlias() {
  redirect("/integrations");
}
