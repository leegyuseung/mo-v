import LiveBoxScreenClient from "@/components/screens/live-box/live-box-screen-client";
import type { LiveBoxScreenProps } from "@/types/live-box-screen";

/** 서버 래퍼: 상태/이벤트가 필요한 화면 로직은 클라이언트 리프에 위임한다. */
export default function LiveBoxScreen(props: LiveBoxScreenProps) {
  return <LiveBoxScreenClient {...props} />;
}
