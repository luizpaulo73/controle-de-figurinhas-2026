import { Pressable, StyleSheet, Text, View } from "react-native";

export type StickerSectionItem = {
    id: string;
    code: string;
    owned: number;
};

type StickerSectionProps = {
    teamCode: string;
    countryName: string;
    countryRgb: string;
    flagEmoji: string;
    groupName: string;
    stickers: StickerSectionItem[];
    onAddSticker: (code: string) => void;
    onRemoveSticker: (code: string) => void;
};

export default function StickerSection({
    teamCode,
    countryName,
    countryRgb,
    flagEmoji,
    groupName,
    stickers,
    onAddSticker,
    onRemoveSticker,
}: StickerSectionProps) {
    const totalStickers = stickers.length;
    const collectedCount = stickers.filter((item) => item.owned > 0).length;
    const progress = totalStickers > 0 ? (collectedCount / totalStickers) * 100 : 0;

    return (
        <View style={styles.wrapper}>
            <View style={[styles.header, { borderBottomColor: countryRgb, borderLeftColor: countryRgb }]}>
                <View style={styles.countryBlock}>
                    <Text style={styles.flagEmoji}>{flagEmoji}</Text>

                    <View>
                        <Text style={styles.countryCode}>{teamCode}</Text>
                        <Text style={styles.countryName}>{countryName}</Text>
                    </View>
                </View>

                <View style={styles.progressBlock}>
                    <Text style={styles.groupText}>Grupo {groupName}</Text>
                    <Text style={styles.progressText}>
                        {collectedCount}/{totalStickers}
                    </Text>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                </View>
            </View>

            <View style={styles.gridContent}>
                {stickers.map((item) => {
                    const isCollected = item.owned > 0;

                    return (
                        <Pressable
                            key={item.id}
                            onPress={() => {
                                if (isCollected) {
                                    onRemoveSticker(item.code);
                                    return;
                                }

                                onAddSticker(item.code);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`Figurinha ${item.code}. Toque para ${isCollected ? "remover" : "adicionar"}.`}
                            style={({ pressed }) => [
                                styles.sticker,
                                isCollected && styles.stickerCollected,
                                pressed && styles.stickerPressed,
                            ]}
                        >
                            <Text style={[styles.stickerText, !isCollected && styles.stickerTextMissing]}>
                                {item.code}
                            </Text>

                            {isCollected && <Text style={styles.check}>✓</Text>}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        backgroundColor: "#30302E",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#65645F",
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderBottomWidth: 4,
        borderLeftWidth: 2,
        borderRadius: 12,
    },
    countryBlock: {
        flexDirection: "row",
        alignItems: "center",
    },
    flagEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    countryCode: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "900",
        letterSpacing: 0.4,
    },
    countryName: {
        color: "#DDE6FA",
        fontSize: 12,
        fontWeight: "600",
    },
    progressBlock: {
        alignItems: "flex-end",
    },
    groupText: {
        color: "#EAF2FF",
        fontSize: 11,
        fontWeight: "700",
        lineHeight: 14,
    },
    progressText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "900",
        lineHeight: 18,
    },
    progressTrack: {
        marginTop: 4,
        width: 86,
        height: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
    },
    gridContent: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 14,
    },
    sticker: {
        width: "19%",
        height: 35,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#65645F",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginBottom: 10,
    },
    stickerPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    stickerCollected: {
        borderColor: "#2ABA57",
        backgroundColor: "#E9F7EE",
    },
    stickerText: {
        color: "#132A45",
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    stickerTextMissing: {
        color: "#6D7480",
    },
    check: {
        position: "absolute",
        right: 6,
        bottom: 2,
        color: "#2ABA57",
        fontSize: 16,
        fontWeight: "900",
        lineHeight: 18,
    },
});
