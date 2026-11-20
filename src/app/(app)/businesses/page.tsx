import type { Metadata } from "next";
import { BusinessList } from "@/features/businesses/business-list";

export const metadata: Metadata = { title: "Businesses" };

export default function BusinessesPage() {
  return <BusinessList />;
}
