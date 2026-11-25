import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/constants";

/**
 * Short QR link: /t/{code} → API records the scan and 302-redirects to the destination.
 * We forward the visitor to the API's redirect endpoint so the scan is attributed.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return NextResponse.redirect(`${getApiUrl()}/api/v1/qr/${encodeURIComponent(code)}/redirect`, 307);
}
