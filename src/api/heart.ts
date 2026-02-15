import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function fetchHeartPoints(userId: string) {
    const { data, error } = await supabase
        .from("heart_points")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw error;
    return data;
}

export async function addHeartPoints(
    userId: string,
    points: number,
    type: string = "etc",
    description?: string
) {
    // 현재 포인트 조회 (없으면 null)
    const { data: current } = await supabase
        .from("heart_points")
        .select("point")
        .eq("id", userId)
        .maybeSingle();

    const currentPoints = current?.point || 0;
    const newPoints = currentPoints + points;

    // upsert: 행이 없으면 생성, 있으면 업데이트
    const { data, error } = await supabase
        .from("heart_points")
        .upsert({
            id: userId,
            point: newPoints,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw error;

    // 히스토리 기록
    await supabase.from("heart_point_history").insert({
        user_id: userId,
        amount: points,
        type,
        description: description || null,
        after_point: newPoints,
    });

    return data;
}

export async function fetchHeartPointHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
) {
    const { data, error, count } = await supabase
        .from("heart_point_history")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
}
