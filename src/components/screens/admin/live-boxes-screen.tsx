import LiveBoxesScreenClient from "@/components/screens/admin/live-boxes-screen-client";

/** 서버 래퍼: 클라이언트 의존 로직을 하위 컴포넌트로 격리한다. */
export default function LiveBoxesScreen() {
  return <LiveBoxesScreenClient />;
}
