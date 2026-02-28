import type { Metadata } from "next";
import LegalDocumentScreen from "@/components/screens/legal/legal-document-screen";
import marketingMd from "@/app/(auth)/signup/agreements/marketing.md";

export const metadata: Metadata = {
  title: "마케팅 수신 동의 | mo-v",
};

export default function LegalMarketingPage() {
  return <LegalDocumentScreen title="마케팅 수신 동의" content={marketingMd} />;
}
