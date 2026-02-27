"use client";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  Boxes,
  Clapperboard,
  MicVocal,
  Megaphone,
  Gem,
  Shield,
  Trophy,
  TvMinimalPlay,
  UsersRound,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "../ui/sidebar";
import { useAuthStore } from "@/store/useAuthStore";

type MenuItem = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  url?: string;
};

// 완성된 화면만 링크를 연결한다.
const menuItems = [
  { title: "라이브", url: "/live", icon: TvMinimalPlay },
  { title: "라이브박스", url: "/live-box", icon: Boxes },
  { title: "버츄얼", url: "/vlist", icon: Gem },
  { title: "그룹", url: "/group", icon: MicVocal },
  { title: "소속", url: "/crew", icon: UsersRound },
  { title: "순위", icon: Trophy },
  { title: "홍보", icon: Megaphone },
  { title: "콘텐츠", url: "/contents", icon: Clapperboard },
] satisfies MenuItem[];

const isNavigableItem = (item: MenuItem) => {
  return Boolean(item.url);
};

export default function AppSideBar() {
  const { profile } = useAuthStore();
  const isAdmin = (profile?.role || "").trim().toLowerCase() === "admin";

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-none p-1.5 md:top-[72px] md:!h-[calc(100svh-72px)] md:z-20"
    >
      <SidebarContent className="bg-white border-r-0 flex items-center pt-2 md:pt-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {isNavigableItem(item) ? (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className="hover:bg-transparent hover:text-blue-600"
                    >
                      <Link href={item.url!}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      disabled
                      tooltip={`${item.title} (준비중)`}
                      className="cursor-not-allowed"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 관리자 메뉴 */}
      {isAdmin && (
        <SidebarFooter className="bg-white mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="관리자"
                className="hover:bg-transparent hover:text-blue-600"
              >
                <Link href="/admin">
                  <Shield className="w-5 h-5" />
                  <span>관리자</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
