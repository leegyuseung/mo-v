"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  clearAccountRestrictedPayload,
  getAccountRestrictedDescription,
  parseAccountRestrictedPayload,
  readAccountRestrictedPayloadSnapshot,
} from "@/lib/account-restricted";

function subscribeAccountRestrictedPayload() {
  return () => undefined;
}

export default function AccountRestrictedScreen() {
  const payloadSnapshot = useSyncExternalStore(
    subscribeAccountRestrictedPayload,
    readAccountRestrictedPayloadSnapshot,
    () => null
  );
  const payload = useMemo(
    () => (payloadSnapshot ? parseAccountRestrictedPayload(payloadSnapshot) : null),
    [payloadSnapshot]
  );

  useEffect(() => {
    clearAccountRestrictedPayload();
  }, []);

  const description = useMemo(
    () =>
      getAccountRestrictedDescription(
        payload?.status,
        payload?.suspended_until,
        payload?.reason
      ),
    [payload]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-red-600">이용 제한 안내</p>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">계정 사용이 제한되었습니다.</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
        <div className="mt-6 flex gap-2">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white"
          >
            로그인 화면으로
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-700"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
