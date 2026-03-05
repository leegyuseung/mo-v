import type { Metadata } from "next";
import LegalDocumentScreen from "@/components/screens/legal/legal-document-screen";
import privacyMd from "@/app/(auth)/signup/agreements/privacy.md";
import thirdPartyMd from "@/app/(auth)/signup/agreements/third_party.md";

export const metadata: Metadata = {
  title: "개인정보처리방침 | mo-v",
};

const PRIVACY_POLICY_MD = `${privacyMd}\n\n---\n\n${thirdPartyMd}`;

export default function LegalPrivacyPolicyPage() {
  return <LegalDocumentScreen title="개인정보처리방침" content={PRIVACY_POLICY_MD} />;
}
