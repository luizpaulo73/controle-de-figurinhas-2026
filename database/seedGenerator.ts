import { groups } from "./albumStructure/groups";

type StickerSeed = {
    code: string;
    group_type: "INTRO" | "TEAM" | "FWC" | "COCA";
    team_code: string | null;
    group: string | null;
    number: number;
};

export function generateStickerSeeds(): StickerSeed[] {
    const stickers: StickerSeed[] = [];

    // panini 00 sticker
    stickers.push({
        code: "00",
        group_type: "INTRO",
        team_code: null,
        group: null,
        number: 0,
    });

    // panini FWC stickers (initial page)
    for (let i = 1; i <= 8; i++) {
        stickers.push({
            code: `FWC${i}`,
            group_type: "INTRO",
            team_code: null,
            group: null,
            number: i,
        });
    }

    // countries (48 teams with 20 stickers each)
    groups.forEach((g) => {
        g.teams.forEach((team) => {
            for (let i = 1; i <= 20; i++) {
                stickers.push({
                    code: `${team}${i}`,
                    group_type: "TEAM",
                    team_code: team,
                    group: g.group,
                    number: i,
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
        });
    }

    return stickers;
}