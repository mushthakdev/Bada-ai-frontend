import { NextResponse } from "next/server";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

/**
 * Short QR link: /t/{code} → API records the scan and 302-redirects to the destination.
 * We forward the visitor to the API's redirect endpoint so the scan is attributed.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return NextResponse.redirect(`${API_URL}/api/v1/qr/${encodeURIComponent(code)}/redirect`, 307);
}
