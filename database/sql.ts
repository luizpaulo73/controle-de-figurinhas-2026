import { db } from "./db";
import { generateStickerSeed } from "./seedGenerator";

const DB_VERSION = 1;
let initialized = false;

export function initDB() {
    if (initialized) {
        return;
    }

    const row = db.getFirstSync<{ user_version: number }>("PRAGMA user_version;");
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
                owned INTEGER DEFAULT 0
            );
        `);

        db.execSync(`CREATE UNIQUE INDEX IF NOT EXISTS idx_stickers_code ON stickers(code);`);
        db.execSync(`PRAGMA user_version = ${DB_VERSION};`);
    }

    initialized = true;
}

export function seedStickers() {
    const row = db.getFirstSync<{ count: number }>("SELECT COUNT(*) as count FROM stickers");

    const count = row?.count ?? 0;
    if (count > 0) return;

    const data = generateStickerSeed();

    data.forEach((s) => {
        db.runSync(
            `INSERT INTO stickers (code, group_type, team_code, group_name, number)
            VALUES (?, ?, ?, ?, ?)`,
            [s.code, s.group_type, s.team_code, s.group, s.number]
        );
    });
}

export function markAsOwned(code: string) {
    db.runSync(`UPDATE stickers SET owned = 1 WHERE code = ?`, [code]);
}

export function addSticker(code: string) {
    db.runSync(`UPDATE stickers SET owned = owned + 1 WHERE code = ?`, [code]);
}

export function removeSticker(code: string) {
    db.runSync(
        `UPDATE stickers 
         SET owned = CASE 
            WHEN owned > 0 THEN owned - 1 
            ELSE 0 
         END
         WHERE code = ?`,
        [code]
    );
}

export function getStickerByCode(code: string) {
    return db.getFirstSync(`SELECT * FROM stickers WHERE code = ?`, [code]);
}