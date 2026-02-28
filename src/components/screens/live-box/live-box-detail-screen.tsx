import LiveBoxDetailScreenClient from "@/components/screens/live-box/live-box-detail-screen-client";
import type { LiveBoxDetailScreenProps } from "@/types/live-box-screen";

/** 서버 래퍼: 상태/이벤트가 필요한 상세 UI는 클라이언트 리프로 분리한다. */
export default function LiveBoxDetailScreen(props: LiveBoxDetailScreenProps) {
  return <LiveBoxDetailScreenClient {...props} />;
}
