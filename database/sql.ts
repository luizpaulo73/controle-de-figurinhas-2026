import { AlbumTeamSection, TeamStickerRow } from "../types/sqlAlbum";
import { teamCountryMeta } from "./albumStructure/countries";
import { db } from "./db";
import { generateStickerSeed } from "./seedGenerator";

const DB_VERSION = 2;
let initialized = false;

type TableInfoRow = {
    name: string;
};

type SpecialStickerRow = {
    id: number;
    code: string;
    number: number;
    owned: number | null;
};

function getStickersColumnNames() {
    const columns = db.getAllSync<TableInfoRow>("PRAGMA table_info(stickers);");
    return new Set(columns.map((column) => column.name));
}

function syncTeamCountryMetadata() {
    Object.entries(teamCountryMeta).forEach(([teamCode, countryMeta]) => {
        db.runSync(
            `UPDATE stickers
             SET country_name = ?, country_rgb = ?, flag_emoji = ?
             WHERE team_code = ?`,
            [
                countryMeta.name,
                countryMeta.rgb,
                countryMeta.flagEmoji,
                teamCode,
            ],
        );
    });
}

export function initDB() {
    if (initialized) {
        return;
    }

    const row = db.getFirstSync<{ user_version: number }>(
        "PRAGMA user_version;",
    );
    const currentVersion = row?.user_version ?? 0;

    if (currentVersion < 1) {
        db.execSync(`
            CREATE TABLE IF NOT EXISTS stickers (
                id INTEGER PRIMARY KEY NOT NULL,
                code TEXT UNIQUE,
                group_type TEXT,
                team_code TEXT,
                group_name TEXT,
                number INTEGER,
                country_name TEXT,
                country_rgb TEXT,
                flag_emoji TEXT,
                owned INTEGER DEFAULT 0
            );
        `);

        db.execSync(
            `CREATE UNIQUE INDEX IF NOT EXISTS idx_stickers_code ON stickers(code);`,
        );
    }

    if (currentVersion < 2) {
        const columnNames = getStickersColumnNames();

        if (!columnNames.has("country_name")) {
            db.execSync("ALTER TABLE stickers ADD COLUMN country_name TEXT;");
        }

        if (!columnNames.has("country_rgb")) {
            db.execSync("ALTER TABLE stickers ADD COLUMN country_rgb TEXT;");
        }

        if (!columnNames.has("flag_emoji")) {
            db.execSync("ALTER TABLE stickers ADD COLUMN flag_emoji TEXT;");
        }

        db.execSync(`PRAGMA user_version = ${DB_VERSION};`);
    }

    initialized = true;
}

export function seedStickers() {
    const row = db.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM stickers",
    );

    const count = row?.count ?? 0;
    if (count === 0) {
        const data = generateStickerSeed();

        data.forEach((s) => {
            db.runSync(
                `INSERT INTO stickers (
                    code,
                    group_type,
                    team_code,
                    group_name,
                    number,
                    country_name,
                    country_rgb,
                    flag_emoji
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    s.code,
                    s.group_type,
                    s.team_code,
                    s.group,
                    s.number,
                    s.country_name,
                    s.country_rgb,
                    s.flag_emoji,
                ],
            );
        });
    }

    syncTeamCountryMetadata();
}

export function addSticker(code: string) {
    db.runSync(`UPDATE stickers SET owned = 1 WHERE code = ?`, [code]);
}

export function removeSticker(code: string) {
    db.runSync(`UPDATE stickers SET owned = 0 WHERE code = ?`, [code]);
}

export function getStickerByCode(code: string) {
    return db.getFirstSync(`SELECT * FROM stickers WHERE code = ?`, [code]);
}

export function getAlbumTeamSections(): AlbumTeamSection[] {
    initDB();
    seedStickers();

    const specialRows = db.getAllSync<SpecialStickerRow>(
        `SELECT id, code, number, owned
         FROM stickers
         WHERE group_type IN ('INTRO', 'HOST', 'FWC')
         ORDER BY CASE WHEN code = '00' THEN 0 ELSE number END ASC`,
    );

    const specialSection: AlbumTeamSection | null =
        specialRows.length > 0
            ? {
                  id: "FWC_SPECIAL",
                  teamCode: "FWC",
                  countryName: "Figurinha 00 + Especiais",
                  countryRgb: "rgb(124, 89, 22)",
                  flagEmoji: "🏆",
                  groupName: "FWC",
                  stickers: specialRows.map((row) => ({
                      id: row.code,
                      code: row.code,
                      number: row.number,
                      owned: row.owned ?? 0,
                  })),
              }
            : null;

    const rows = db.getAllSync<TeamStickerRow>(
        `SELECT id, code, team_code, group_name, number, country_name, country_rgb, flag_emoji, owned
         FROM stickers
         WHERE group_type = 'TEAM'
         ORDER BY id ASC`,
    );

    const sectionsByTeam = new Map<string, AlbumTeamSection>();

    rows.forEach((row) => {
        if (!row.team_code || !row.group_name) {
            return;
        }

        const teamCode = row.team_code;
        const fallbackCountryMeta = teamCountryMeta[teamCode];
        const existingSection = sectionsByTeam.get(teamCode);

        if (existingSection) {
            existingSection.stickers.push({
                id: row.code,
                code: row.code,
                number: row.number,
                owned: row.owned ?? 0,
            });
            return;
        }

        sectionsByTeam.set(teamCode, {
            id: teamCode,
            teamCode,
            countryName:
                row.country_name ?? fallbackCountryMeta?.name ?? teamCode,
            countryRgb:
                row.country_rgb ??
                fallbackCountryMeta?.rgb ??
                "rgb(10, 46, 111)",
            flagEmoji: row.flag_emoji ?? fallbackCountryMeta?.flagEmoji ?? "🏳️",
            groupName: row.group_name,
            stickers: [
                {
                    id: row.code,
                    code: row.code,
                    number: row.number,
                    owned: row.owned ?? 0,
                },
            ],
        });
    });

    const teamSections = Array.from(sectionsByTeam.values());

    if (!specialSection) {
        return teamSections;
    }

    return [specialSection, ...teamSections];
}
