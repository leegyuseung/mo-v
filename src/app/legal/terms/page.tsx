import type { Metadata } from "next";
import LegalDocumentScreen from "@/components/screens/legal/legal-document-screen";
import termsMd from "@/app/(auth)/signup/agreements/terms.md";

export const metadata: Metadata = {
  title: "서비스 이용약관 | mo-v",
};

export default function LegalTermsPage() {
  return <LegalDocumentScreen title="서비스 이용약관" content={termsMd} />;
}
