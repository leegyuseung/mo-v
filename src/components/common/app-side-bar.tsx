"use client";
import Link from "next/link";
import { useState, type ComponentType } from "react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  ChevronDown,
  Clapperboard,
  MicVocal,
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
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { hasAdminAccess } from "@/utils/role";

type SubMenuItem = {
  title: string;
  url?: string;
};

type MenuItem = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  url?: string;
  children?: SubMenuItem[];
};

// 완성된 화면만 링크를 연결한다.
const menuItems = [
  { title: "라이브", url: "/live", icon: TvMinimalPlay },
  { title: "라이브박스", url: "/live-box", icon: Boxes },
  { title: "버츄얼", url: "/vlist", icon: Gem },
  { title: "그룹", url: "/group", icon: MicVocal },
  { title: "소속", url: "/crew", icon: UsersRound },
  { title: "순위", url: "/rank", icon: Trophy },
  { title: "집계", url: "/aggregate", icon: BarChart3 },
  { title: "콘텐츠", url: "/contents", icon: Clapperboard },
  {
    title: "게시판",
    url: "/community",
    icon: ClipboardList,
    children: [
      { title: "공지사항", url: "/notice" },
      { title: "커뮤니티", url: "/community" },
    ],
  },
] satisfies MenuItem[];

const isNavigableItem = (item: MenuItem) => {
  return Boolean(item.url);
};

const hasSubMenu = (item: MenuItem) => {
  return Boolean(item.children?.length);
};

export default function AppSideBar() {
  const { profile } = useAuthStore();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const [openSubMenuTitle, setOpenSubMenuTitle] = useState<string | null>(null);
  const isAdmin = hasAdminAccess(profile?.role);
  const isSidebarCollapsed = state === "collapsed";
  const closeSidebarOnMobile = () => {
    if (!isMobile) return;
    setOpenMobile(false);
  };
  const closeSubMenu = () => {
    setOpenSubMenuTitle(null);
  };
  const toggleSubMenu = (title: string) => {
    setOpenSubMenuTitle((current) => (current === title ? null : title));
  };

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
                  {hasSubMenu(item) ? (
                    isSidebarCollapsed ? (
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className="hover:bg-transparent hover:text-blue-600"
                      >
                        <Link
                          href={item.url || item.children?.[0]?.url || "#"}
                          prefetch={false}
                          onClick={() => {
                            closeSubMenu();
                            closeSidebarOnMobile();
                          }}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                    <>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="hover:bg-transparent hover:text-blue-600"
                        onClick={() => toggleSubMenu(item.title)}
                        aria-expanded={openSubMenuTitle === item.title}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                        <ChevronDown
                          className={`ml-auto h-4 w-4 transition-transform ${
                            openSubMenuTitle === item.title ? "rotate-180" : ""
                          }`}
                        />
                      </SidebarMenuButton>
                      {openSubMenuTitle === item.title ? (
                        <SidebarMenuSub>
                          {item.children!.map((child) => (
                            <SidebarMenuSubItem key={`${item.title}-${child.title}`}>
                              {child.url ? (
                                <SidebarMenuSubButton asChild>
                                  <Link
                                    href={child.url}
                                    prefetch={false}
                                    onClick={() => {
                                      closeSubMenu();
                                      closeSidebarOnMobile();
                                    }}
                                  >
                                    <span>{child.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              ) : (
                                <SidebarMenuSubButton
                                  aria-disabled="true"
                                  className="cursor-not-allowed text-gray-400 hover:bg-transparent hover:text-gray-400"
                                >
                                  <span>{child.title}</span>
                                </SidebarMenuSubButton>
                              )}
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      ) : null}
                    </>
                    )
                  ) : isNavigableItem(item) ? (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className="hover:bg-transparent hover:text-blue-600"
                    >
                      <Link
                        href={item.url!}
                        prefetch={false}
                        onClick={() => {
                          closeSubMenu();
                          closeSidebarOnMobile();
                        }}
                      >
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
                <Link href="/admin" prefetch={false} onClick={closeSidebarOnMobile}>
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
