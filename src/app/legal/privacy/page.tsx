import type { Metadata } from "next";
import LegalDocumentScreen from "@/components/screens/legal/legal-document-screen";
import privacyMd from "@/app/(auth)/signup/agreements/privacy.md";

export const metadata: Metadata = {
  title: "개인정보 수집·이용 | mo-v",
};

export default function LegalPrivacyPage() {
  return <LegalDocumentScreen title="개인정보 수집·이용" content={privacyMd} />;
}
