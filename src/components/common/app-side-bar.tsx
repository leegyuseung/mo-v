"use client";
import Link from "next/link";
import { Users, Menu, TvMinimalPlay } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";

// 메뉴 구성 데이터
const menuItems = [
  { title: "라이브", url: "/live", icon: TvMinimalPlay },
  { title: "리스트", url: "/vlist", icon: Users },
];

export default function AppSideBar() {
  const { toggleSidebar } = useSidebar();
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-none p-1.5">
      <SidebarContent className="bg-white border-r-0 flex items-center">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem onClick={toggleSidebar}>
                <SidebarMenuButton className="cursor-pointer">
                  <Menu className="w-5 h-5" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 첫 번째 메뉴그룹 */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
