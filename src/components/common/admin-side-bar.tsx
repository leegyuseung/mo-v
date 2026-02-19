"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Clock,
    ArrowLeft,
    UserRoundPen,
    MicVocal,
    UsersRound,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader,
    useSidebar,
} from "../ui/sidebar";

const adminMenuItems = [
    { title: "대시보드", url: "/admin", icon: LayoutDashboard },
    { title: "유저/버츄얼 관리", url: "/admin/users", icon: Users },
    { title: "그룹 관리", url: "/admin/groups", icon: MicVocal },
    { title: "크루 관리", url: "/admin/crews", icon: UsersRound },
    { title: "버츄얼 등록 대기", url: "/admin/pending", icon: Clock },
    { title: "정보 수정 요청", url: "/admin/infoeditrq", icon: UserRoundPen },
];

export default function AdminSideBar() {
    const pathname = usePathname();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-none">
            <SidebarHeader className="bg-gray-900 p-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h2 className="text-white font-bold text-sm">mo-v Admin</h2>
                            <p className="text-gray-400 text-xs">관리자 패널</p>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-gray-900">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider">
                        메뉴
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {adminMenuItems.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={`transition-colors ${isActive
                                                ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 hover:text-indigo-300"
                                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                                }`}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="w-5 h-5" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-gray-900 p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="메인으로"
                            className="text-gray-400 hover:bg-gray-800 hover:text-white"
                        >
                            <Link href="/">
                                <ArrowLeft className="w-5 h-5" />
                                <span>메인으로 돌아가기</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
