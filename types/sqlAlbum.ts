export type TeamStickerRow = {
    id: number;
    code: string;
    team_code: string | null;
    group_name: string | null;
    number: number;
    country_name: string | null;
    country_rgb: string | null;
    flag_emoji: string | null;
    owned: number | null;
};

export type AlbumSticker = {
    id: string;
    code: string;
    number: number;
    owned: number;
};

export type AlbumTeamSection = {
    id: string;
    teamCode: string;
    countryName: string;
    countryRgb: string;
    flagEmoji: string;
    groupName: string;
    stickers: AlbumSticker[];
};