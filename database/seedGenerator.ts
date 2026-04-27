import { groups } from "./albumStructure/groups";
import { teamCountryMeta } from "./albumStructure/countries";

type StickerSeed = {
    code: string;
    group_type: "INTRO" | "HOST" | "TEAM" | "FWC" | "COCA";
    team_code: string | null;
    group: string | null;
    number: number;
    country_name: string | null;
    country_rgb: string | null;
    flag_emoji: string | null;
};

export function generateStickerSeed(): StickerSeed[] {
    const stickers: StickerSeed[] = [];

    // panini 00 sticker
    stickers.push({
        code: "00",
        group_type: "INTRO",
        team_code: null,
        group: null,
        number: 0,
        country_name: null,
        country_rgb: null,
        flag_emoji: null,
    });

    // panini FWC stickers (initial page)
    for (let i = 1; i <= 4; i++) {
        stickers.push({
            code: `FWC${i}`,
            group_type: "INTRO",
            team_code: null,
            group: null,
            number: i,
            country_name: null,
            country_rgb: null,
            flag_emoji: null,
        });
    }

    // host country and ball stickers (4 stickers)
    for (let i = 5; i <= 8; i++) {
        stickers.push({
            code: `FWC${i}`,
            group_type: "HOST",
            team_code: null,
            group: null,
            number: i,
            country_name: null,
            country_rgb: null,
            flag_emoji: null,
        });
    }

    // countries (48 teams with 20 stickers each)
    groups.forEach((g) => {
        g.teams.forEach((team) => {
            const countryMeta = teamCountryMeta[team];

            for (let i = 1; i <= 20; i++) {
                stickers.push({
                    code: `${team}${i}`,
                    group_type: "TEAM",
                    team_code: team,
                    group: g.group,
                    number: i,
                    country_name: countryMeta?.name ?? team,
                    country_rgb: countryMeta?.rgb ?? "rgb(10, 46, 111)",
                    flag_emoji: countryMeta?.flagEmoji ?? "🏳️",
                });
            }
        });
    });

    // fifa history stickers (10 stickers)
    for (let i = 9; i <= 19; i++) {
        stickers.push({
            code: `FWC${i}`,
            group_type: "FWC",
            team_code: null,
            group: null,
            number: i,
            country_name: null,
            country_rgb: null,
            flag_emoji: null,
        });
    }

    // coca-cola stickers (14 stickers)
    for (let i = 1; i <= 14; i++) {
        stickers.push({
            code: `CC${i}`,
            group_type: "COCA",
            team_code: null,
            group: null,
            number: i,
            country_name: null,
            country_rgb: null,
            flag_emoji: null,
        });
    }

    return stickers;
}