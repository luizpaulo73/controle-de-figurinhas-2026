export type TeamStickerRow = {
    id: number;
    code: string;
    team_code: string | null;
    group_name: string | null;
    number: number;
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
    groupName: string;
    stickers: AlbumSticker[];
};