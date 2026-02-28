import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function withBaseUrl(path: string) {
  return `${SITE_URL}${path}`;
}

function toDate(value?: string | null) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function staticEntries(now: Date): MetadataRoute.Sitemap {
  return [
    {
      url: withBaseUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: withBaseUrl("/live"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: withBaseUrl("/vlist"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: withBaseUrl("/group"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: withBaseUrl("/crew"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: withBaseUrl("/contents"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: withBaseUrl("/live-box"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: withBaseUrl("/star"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.65,
    },
    {
      url: withBaseUrl("/rank"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: withBaseUrl("/legal"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: withBaseUrl("/legal/terms"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.35,
    },
    {
      url: withBaseUrl("/legal/privacy"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.35,
    },
    {
      url: withBaseUrl("/legal/third-party"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.35,
    },
    {
      url: withBaseUrl("/legal/marketing"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const baseEntries = staticEntries(now);

  if (!supabaseUrl || !supabaseAnonKey) {
    return baseEntries;
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  try {
    const [streamersResult, groupsResult, crewsResult, liveBoxResult, contentsResult] =
      await Promise.all([
        supabase.from("streamers").select("public_id, created_at").not("public_id", "is", null),
        supabase.from("idol_groups").select("group_code, created_at, updated_at"),
        supabase.from("crews").select("crew_code, created_at, updated_at"),
        supabase.from("live_box").select("id, created_at"),
        supabase
          .from("contents")
          .select("id, created_at, updated_at, status")
          .in("status", ["approved", "ended"]),
      ]);

    const streamers =
      streamersResult.error || !streamersResult.data ? [] : streamersResult.data;
    const groups = groupsResult.error || !groupsResult.data ? [] : groupsResult.data;
    const crews = crewsResult.error || !crewsResult.data ? [] : crewsResult.data;
    const liveBoxes = liveBoxResult.error || !liveBoxResult.data ? [] : liveBoxResult.data;
    const contents =
      contentsResult.error || !contentsResult.data ? [] : contentsResult.data;

    const streamerEntries: MetadataRoute.Sitemap = streamers.map((streamer) => ({
      url: withBaseUrl(`/vlist/${encodeURIComponent(streamer.public_id)}`),
      lastModified: toDate(streamer.created_at),
      changeFrequency: "daily",
      priority: 0.75,
    }));

    const groupEntries: MetadataRoute.Sitemap = groups.map((group) => ({
      url: withBaseUrl(`/group/${encodeURIComponent(group.group_code)}`),
      lastModified: toDate(group.updated_at || group.created_at),
      changeFrequency: "weekly",
      priority: 0.65,
    }));

    const crewEntries: MetadataRoute.Sitemap = crews.map((crew) => ({
      url: withBaseUrl(`/crew/${encodeURIComponent(crew.crew_code)}`),
      lastModified: toDate(crew.updated_at || crew.created_at),
      changeFrequency: "weekly",
      priority: 0.65,
    }));

    const liveBoxEntries: MetadataRoute.Sitemap = liveBoxes.map((liveBox) => ({
      url: withBaseUrl(`/live-box/${liveBox.id}`),
      lastModified: toDate(liveBox.created_at),
      changeFrequency: "daily",
      priority: 0.7,
    }));

    const contentEntries: MetadataRoute.Sitemap = contents.map((content) => ({
      url: withBaseUrl(`/contents/${content.id}`),
      lastModified: toDate(content.updated_at || content.created_at),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [
      ...baseEntries,
      ...streamerEntries,
      ...groupEntries,
      ...crewEntries,
      ...liveBoxEntries,
      ...contentEntries,
    ];
  } catch {
    return baseEntries;
  }
}
