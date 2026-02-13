"use client";

import { useEffect, useRef, useState } from "react";
import { changePassword } from "@/api/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/useAuthStore";
import { useUpdateProfile } from "@/hooks/mutations/profile/use-update-profile";
import { profileSchema, ProfileFormValues } from "@/utils/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    User,
    Camera,
    Mail,
    CalendarDays,
    Heart,
    Save,
    X,
    Gift,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, profile, heartPoints, isLoading } = useAuthStore();
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // 비밀번호 변경 상태
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [isPwChanging, setIsPwChanging] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPw) {
            toast.error("현재 비밀번호를 입력해주세요.");
            return;
        }
        if (!newPw) {
            toast.error("변경할 비밀번호를 입력해주세요.");
            return;
        }
        if (newPw !== confirmPw) {
            toast.error("변경할 비밀번호가 일치하지 않습니다.");
            return;
        }
        if (newPw.length < 6) {
            toast.error("비밀번호는 6자 이상이어야 합니다.");
            return;
        }

        setIsPwChanging(true);
        try {
            await changePassword(
                user?.email || profile?.email || "",
                currentPw,
                newPw
            );
            toast.success("비밀번호가 성공적으로 변경되었습니다.");
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.";
            toast.error(message);
        } finally {
            setIsPwChanging(false);
        }
    };

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            nickname: "",
            bio: "",
        },
    });

    const bioValue = watch("bio");

    // 프로필 데이터가 로드되면 폼에 반영
    useEffect(() => {
        if (profile) {
            reset({
                nickname: profile.nickname || "",
                bio: profile.bio || "",
            });
            setAvatarPreview(null);
            setAvatarFile(null);
        }
    }, [profile, reset]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 5MB 제한
        if (file.size > 5 * 1024 * 1024) {
            alert("파일 크기는 5MB 이하만 가능합니다.");
            return;
        }

        // 이미지 파일만 허용
        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 업로드 가능합니다.");
            return;
        }

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            setAvatarPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setAvatarFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // 처음 프로필 수정인지 확인 (DB 컬럼으로 체크)
    const isFirstEdit = profile?.is_first_edit ?? false;

    const onSubmit = (data: ProfileFormValues) => {
        if (!user) return;

        updateProfile({
            userId: user.id,
            nickname: data.nickname,
            bio: data.bio || "",
            avatarFile,
            isFirstEdit,
        });
    };

    const hasChanges = isDirty || avatarFile !== null;

    // 가입일 포맷
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto p-6 mt-8">
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-28 w-28 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    if (!user || !profile) {
        return (
            <div className="max-w-2xl mx-auto p-6 mt-8">
                <div className="text-center py-16">
                    <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        로그인이 필요합니다
                    </h2>
                    <p className="text-gray-500">
                        프로필을 수정하려면 먼저 로그인해주세요.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 mt-4">
            {/* 페이지 헤더 */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">프로필 수정</h1>
                <p className="text-sm text-gray-500 mt-1">
                    나의 프로필 정보를 수정할 수 있습니다.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* 프로필 사진 섹션 */}
                <div className="bg-gray-50 rounded-2xl p-6">
                    <Label className="text-sm font-semibold text-gray-700 mb-4 block">
                        프로필 사진
                    </Label>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Avatar className="h-28 w-28 ring-4 ring-white shadow-lg">
                                {avatarPreview ? (
                                    <AvatarImage src={avatarPreview} alt="프로필 미리보기" />
                                ) : profile.avatar_url ? (
                                    <AvatarImage src={profile.avatar_url} alt="프로필 사진" />
                                ) : (
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500">
                                        <User className="w-12 h-12 text-white" />
                                    </AvatarFallback>
                                )}
                            </Avatar>

                            {/* 오버레이 버튼 */}
                            <button
                                type="button"
                                onClick={handleAvatarClick}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Camera className="w-7 h-7 text-white" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-gray-500">
                                JPG, PNG, GIF (최대 5MB)
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAvatarClick}
                                    className="text-xs"
                                >
                                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                                    사진 변경
                                </Button>
                                {avatarFile && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveAvatar}
                                        className="text-xs text-red-500 hover:text-red-600"
                                    >
                                        <X className="w-3.5 h-3.5 mr-1" />
                                        취소
                                    </Button>
                                )}
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </div>

                {/* 닉네임 */}
                <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-sm font-semibold text-gray-700">
                        닉네임
                    </Label>
                    <Input
                        id="nickname"
                        placeholder="닉네임을 입력해주세요"
                        {...register("nickname")}
                        className="h-11"
                    />
                    {errors.nickname && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors.nickname.message}
                        </p>
                    )}
                </div>

                {/* 자기소개 */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
                            자기소개
                        </Label>
                        <span
                            className={`text-xs ${(bioValue?.length || 0) > 200
                                ? "text-red-500"
                                : "text-gray-400"
                                }`}
                        >
                            {bioValue?.length || 0} / 200
                        </span>
                    </div>
                    <Textarea
                        id="bio"
                        placeholder="자기소개를 입력해주세요"
                        rows={4}
                        {...register("bio")}
                        className="resize-none"
                    />
                    {errors.bio && (
                        <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>
                    )}
                </div>

                <Separator />

                {/* 읽기 전용 정보 */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-700">계정 정보</h2>

                    {/* 이메일 */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400">이메일</p>
                            <p className="text-sm text-gray-700 truncate">
                                {profile.email || user.email || "-"}
                            </p>
                        </div>
                    </div>

                    {/* 가입일 */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <CalendarDays className="w-5 h-5 text-gray-400 shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-400">가입일</p>
                            <p className="text-sm text-gray-700">
                                {formatDate(profile.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* 하트 포인트 */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Heart className="w-5 h-5 text-red-400 fill-red-400 shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-400">하트 포인트</p>
                            <p className="text-sm font-semibold text-gray-700">
                                {heartPoints?.point?.toLocaleString() || 0} P
                            </p>
                        </div>
                    </div>
                </div>

                {user.app_metadata?.provider === "email" && (
                    <>
                        <Separator />

                        {/* 비밀번호 변경 */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-semibold text-gray-700">비밀번호 변경</h2>

                            {/* 현재 비밀번호 */}
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">현재 비밀번호</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type={showCurrentPw ? "text" : "password"}
                                        placeholder="현재 비밀번호를 입력해주세요"
                                        value={currentPw}
                                        onChange={(e) => setCurrentPw(e.target.value)}
                                        className="h-11 pl-9 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* 변경할 비밀번호 */}
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">변경할 비밀번호</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type={showNewPw ? "text" : "password"}
                                        placeholder="변경할 비밀번호를 입력해주세요"
                                        value={newPw}
                                        onChange={(e) => setNewPw(e.target.value)}
                                        className="h-11 pl-9 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPw(!showNewPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* 변경할 비밀번호 확인 */}
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">변경할 비밀번호 확인</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type={showConfirmPw ? "text" : "password"}
                                        placeholder="변경할 비밀번호를 다시 입력해주세요"
                                        value={confirmPw}
                                        onChange={(e) => setConfirmPw(e.target.value)}
                                        className="h-11 pl-9 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {confirmPw && newPw !== confirmPw && (
                                    <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={handleChangePassword}
                                    disabled={isPwChanging || !currentPw || !newPw || !confirmPw}
                                    variant="outline"
                                    className="h-10 px-6 rounded-xl font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPwChanging ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                            변경 중...
                                        </div>
                                    ) : (
                                        "비밀번호 변경"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                <Separator />

                {/* 수정하기 버튼 */}
                <div className="flex flex-col items-end gap-3">
                    {isFirstEdit && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                            <Gift className="w-5 h-5 text-amber-500" />
                            <span className="text-sm text-amber-700 font-medium">
                                🎉 첫 프로필 수정 시 <strong className="text-amber-900">50 하트포인트</strong>를 드려요!
                            </span>
                        </div>
                    )}
                    <Button
                        type="submit"
                        disabled={!hasChanges || isPending}
                        className="px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                수정 중...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                수정하기
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
