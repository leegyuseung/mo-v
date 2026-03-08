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
    Siren,
    Bug,
    Boxes,
    Clapperboard,
    ShieldAlert,
} from "lucide-react";
import {
    SidebarTrigger,
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
    SidebarRail,
    useSidebar,
} from "../ui/sidebar";

const adminMenuItems = [
    { title: "대시보드", url: "/admin", icon: LayoutDashboard },
    { title: "유저/버츄얼 관리", url: "/admin/users", icon: Users },
    { title: "그룹 관리", url: "/admin/groups", icon: MicVocal },
    { title: "소속 관리", url: "/admin/crews", icon: UsersRound },
    { title: "박스 관리", url: "/admin/live-box", icon: Boxes },
    { title: "콘텐츠 관리", url: "/admin/contents", icon: Clapperboard },
    { title: "버츄얼 등록 대기", url: "/admin/pending", icon: Clock },
    { title: "정보 수정 요청", url: "/admin/infoeditrq", icon: UserRoundPen },
    { title: "정보 신고 관리", url: "/admin/reports", icon: Siren },
    { title: "오류 신고 관리", url: "/admin/error-reports", icon: Bug },
    { title: "제재 이력", url: "/admin/user-sanctions", icon: ShieldAlert },
];

export default function AdminSideBar() {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();
    const closeSidebarOnMobile = () => {
        if (!isMobile) return;
        setOpenMobile(false);
    };

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-none">
            <SidebarHeader className="bg-gray-900 p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarTrigger className="h-9 w-full justify-start rounded-md px-2 text-gray-400 hover:bg-gray-800 hover:text-white group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 [&>svg]:size-5" />
                    </SidebarMenuItem>
                </SidebarMenu>
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
                                            <Link href={item.url} onClick={closeSidebarOnMobile}>
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
                            <Link href="/" onClick={closeSidebarOnMobile}>
                                <ArrowLeft className="w-5 h-5" />
                                <span>메인으로 돌아가기</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
