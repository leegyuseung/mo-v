"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type AdBannerProps = {
    dataAdSlot: string;
    dataAdFormat?: string;
    dataFullWidthResponsive?: boolean;
};

type AdsByGoogleWindow = Window & {
    adsbygoogle?: unknown[];
};

export default function AdBanner({
    dataAdSlot,
    dataAdFormat = "auto",
    dataFullWidthResponsive = true,
}: AdBannerProps) {
    const pathname = usePathname();

    useEffect(() => {
        try {
            const adsWindow = window as AdsByGoogleWindow;
            const adsByGoogle = adsWindow.adsbygoogle || [];
            adsByGoogle.push({});
            adsWindow.adsbygoogle = adsByGoogle;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("AdSense Error:", message);
        }
    }, [pathname]);

    return (
        <div className="w-full flex justify-center my-4 overflow-hidden">
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-6368269150151357"
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
            />
        </div>
    );
}
