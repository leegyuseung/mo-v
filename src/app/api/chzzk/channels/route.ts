import { NextResponse } from "next/server";

// CHZZK channels API 응답 포맷 변형(content.data / content[] / data[])을 흡수한다.
function pickChannel(raw: unknown) {
  const data = raw as Record<string, unknown> | null;
  if (!data) return null;

  const content = data.content as Record<string, unknown> | unknown[] | undefined;

  // CHZZK 문서 기준: content.data: Object[]
  if (content && !Array.isArray(content)) {
    const nestedData = content.data as unknown[] | undefined;
    if (Array.isArray(nestedData) && nestedData.length > 0) {
      return nestedData[0] as Record<string, unknown>;
    }
  }

  // 호환: content 자체가 배열인 경우
  if (Array.isArray(content) && content.length > 0) {
    return content[0] as Record<string, unknown>;
  }

  // 호환: data 필드가 배열인 경우
  const topData = data.data as unknown[] | undefined;
  if (Array.isArray(topData) && topData.length > 0) {
    return topData[0] as Record<string, unknown>;
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelIds = searchParams.get("channelIds");

  // Admin 화면 자동완성에서 단일 channelId를 전달하는 전용 엔드포인트다.
  if (!channelIds) {
    return NextResponse.json(
      { message: "channelIds is required" },
      { status: 400 }
    );
  }

  try {
    const url = `https://openapi.chzzk.naver.com/open/v1/channels?channelIds=${encodeURIComponent(
      channelIds
    )}`;

    // 서버에서만 보관되는 Client-Secret을 사용해 CHZZK Open API를 호출한다.
    const headers: HeadersInit = {};
    const clientId =
      process.env.CHZZK_CLIENT_ID || process.env.NEXT_PUBLIC_CHZZK_CLIENT_ID;

    if (clientId) {
      headers["Client-Id"] = clientId;
    }
    if (process.env.CHZZK_CLIENT_SECRET) {
      headers["Client-Secret"] = process.env.CHZZK_CLIENT_SECRET;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { message: `CHZZK API failed: ${response.status} ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const channel = pickChannel(data);

    // UI에서 필요한 최소 필드만 노출한다.
    return NextResponse.json({
      channelName:
        (channel?.channelName as string | undefined) ||
        (channel?.name as string | undefined) ||
        null,
      channelImageUrl:
        (channel?.channelImageUrl as string | undefined) ||
        (channel?.imageUrl as string | undefined) ||
        null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch CHZZK channel",
      },
      { status: 500 }
    );
  }
}
