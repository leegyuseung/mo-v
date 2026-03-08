"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    type LucideIcon,
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
    TvMinimalPlay,
    Megaphone,
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
import { useAuthStore } from "@/store/useAuthStore";
import { normalizeRole } from "@/utils/role";

type AdminMenuItem = {
    title: string;
    url: string;
    icon: LucideIcon;
};

type AdminMenuSection = {
    label: string | null;
    items: AdminMenuItem[];
};

const adminMenuSections: AdminMenuSection[] = [
    {
        label: null,
        items: [{ title: "대시보드", url: "/admin", icon: LayoutDashboard }],
    },
    {
        label: "유저",
        items: [
            { title: "유저 관리", url: "/admin/users", icon: Users },
            { title: "유저 제재 이력", url: "/admin/user-sanctions", icon: ShieldAlert },
        ],
    },
    {
        label: "데이터 관리",
        items: [
            { title: "버츄얼 관리", url: "/admin/streamers", icon: TvMinimalPlay },
            { title: "그룹 관리", url: "/admin/groups", icon: MicVocal },
            { title: "소속 관리", url: "/admin/crews", icon: UsersRound },
            { title: "박스 관리", url: "/admin/live-box", icon: Boxes },
            { title: "콘텐츠 관리", url: "/admin/contents", icon: Clapperboard },
            { title: "전광판 관리", url: "/admin/home-broadcasts", icon: Megaphone },
        ],
    },
    {
        label: "요청/신고",
        items: [
            { title: "버츄얼 등록 대기", url: "/admin/pending", icon: Clock },
            { title: "박스 등록 대기 요청", url: "/admin/live-box-pending", icon: Boxes },
            { title: "콘텐츠 등록 대기 요청", url: "/admin/content-pending", icon: Clapperboard },
            { title: "버츄얼 정보수정요청", url: "/admin/infoeditrq", icon: UserRoundPen },
            { title: "데이터 정보 수정 요청", url: "/admin/data-infoeditrq", icon: UserRoundPen },
            { title: "데이터 신고 관리", url: "/admin/reports", icon: Siren },
            { title: "오류 신고 관리", url: "/admin/error-reports", icon: Bug },
        ],
    },
];

export default function AdminSideBar() {
    const pathname = usePathname();
    const { profile } = useAuthStore();
    const { isMobile, setOpenMobile } = useSidebar();
    const isManager = normalizeRole(profile?.role) === "manager";
    // manager는 기본적으로 유저 운영만 맡지만, 전광판은 홈 운영 업무라 예외적으로 접근을 허용한다.
    const managerSections: AdminMenuSection[] = [
        adminMenuSections.find((section) => section.label === "유저"),
        {
            label: "운영",
            items: [{ title: "전광판 관리", url: "/admin/home-broadcasts", icon: Megaphone }],
        },
    ].filter((section): section is AdminMenuSection => Boolean(section));
    const visibleSections = isManager ? managerSections : adminMenuSections;

    const closeSidebarOnMobile = () => {
        if (!isMobile) return;
        setOpenMobile(false);
    };

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-none">
            <SidebarHeader className="bg-gray-900 p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarTrigger className="h-9 w-full justify-start rounded-md px-2 text-gray-400 cursor-pointer hover:bg-gray-800 hover:text-white group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 [&>svg]:size-5" />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-gray-900">
                {visibleSections.map((section, index) => (
                    <SidebarGroup key={section.label || `section-${index}`}>
                        {section.label ? (
                            <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider">
                                {section.label}
                            </SidebarGroupLabel>
                        ) : null}
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.items.map((item) => {
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
                ))}
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
