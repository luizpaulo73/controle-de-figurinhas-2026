import { generateStickerSeed } from "../../database/seedGenerator";

const VALID_STICKER_CODES = new Set(
    generateStickerSeed().map((seed) => seed.code.toUpperCase()),
);
const STICKER_CODE_PATTERN =
    /^(?:00|FWC(?:[1-9]|1[0-9])|CC(?:[1-9]|1[0-4])|[A-Z]{3}(?:[1-9]|1[0-9]|20))$/;
const MAX_TOKEN_WINDOW = 3;

function normalizeCandidate(candidate: string): string {
    return candidate.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeCandidateWithOCRFix(candidate: string): string {
    return normalizeCandidate(candidate).replace(/O/g, "0").replace(/I/g, "1");
}

function isValidStickerCode(candidate: string): boolean {
    // Tentar validação com forma exata
    if (
        STICKER_CODE_PATTERN.test(candidate) &&
        VALID_STICKER_CODES.has(candidate)
    ) {
        return true;
    }

    // Tentar validação com correções OCR (O→0, I→1)
    const withOCRFix = normalizeCandidateWithOCRFix(candidate);
    return (
        STICKER_CODE_PATTERN.test(withOCRFix) &&
        VALID_STICKER_CODES.has(withOCRFix)
    );
}

export function extractStickerCodes(rawText: string): string[] {
    if (!rawText) return [];

    const matches = new Set<string>();

    const tokens = rawText
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 0);

    for (let startIndex = 0; startIndex < tokens.length; startIndex += 1) {
        for (
            let windowSize = 1;
            windowSize <= MAX_TOKEN_WINDOW;
            windowSize += 1
        ) {
            const candidateTokens = tokens.slice(
                startIndex,
                startIndex + windowSize,
            );
            if (candidateTokens.length === 0) continue;

            const candidate = candidateTokens.join("");
            const normalized = normalizeCandidate(candidate);
            const isValid = isValidStickerCode(normalized);

            if (isValid) {
                // Usar a versão com fix se for a que validou
                const finalCode =
                    STICKER_CODE_PATTERN.test(normalized) &&
                    VALID_STICKER_CODES.has(normalized)
                        ? normalized
                        : normalizeCandidateWithOCRFix(candidate);
                matches.add(finalCode);
            }
        }
    }

    return Array.from(matches);
}
