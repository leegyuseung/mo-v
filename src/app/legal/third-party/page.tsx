import type { Metadata } from "next";
import LegalDocumentScreen from "@/components/screens/legal/legal-document-screen";
import thirdPartyMd from "@/app/(auth)/signup/agreements/third_party.md";

export const metadata: Metadata = {
  title: "개인정보 처리위탁 | mo-v",
};

export default function LegalThirdPartyPage() {
  return <LegalDocumentScreen title="개인정보 처리위탁" content={thirdPartyMd} />;
}
