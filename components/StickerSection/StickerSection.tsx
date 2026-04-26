import { FlatList, StyleSheet, Text, View } from "react-native";

type StickerItem = {
    id: string;
    code: string;
    repeated: number;
    isCollected: boolean;
};

const TOTAL_STICKERS = 20;
const REPEATED_BY_NUMBER: Record<number, number> = {
    3: 2,
    6: 3,
    9: 3,
    12: 5,
    17: 5,
};
const COLLECTED_ONLY = new Set([2, 7, 8, 14, 15, 16, 19, 20]);

const MOCK_STICKERS: StickerItem[] = Array.from(
    { length: TOTAL_STICKERS },
    (_, index) => {
        const stickerNumber = index + 1;
        const repeated = REPEATED_BY_NUMBER[stickerNumber] ?? 0;

        return {
            id: `USA${stickerNumber}`,
            code: `USA${stickerNumber}`,
            repeated,
            isCollected: repeated > 0 || COLLECTED_ONLY.has(stickerNumber),
        };
    },
);

export default function StickerSection() {
    const collectedCount = MOCK_STICKERS.filter(
        (item) => item.isCollected,
    ).length;
    const progress = (collectedCount / TOTAL_STICKERS) * 100;

    return (
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <View style={styles.countryBlock}>
                    <Text style={styles.countryCode}>USA</Text>
                    <Text style={styles.countryName}>Estados Unidos</Text>
                </View>

                <View style={styles.progressBlock}>
                    <Text style={styles.progressText}>
                        {collectedCount}/{TOTAL_STICKERS}
                    </Text>
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${progress}%` },
                            ]}
                        />
                    </View>
                </View>
            </View>

            <FlatList
                data={MOCK_STICKERS}
                keyExtractor={(item) => item.id}
                numColumns={5}
                scrollEnabled={false}
                contentContainerStyle={styles.gridContent}
                columnWrapperStyle={styles.gridRow}
                renderItem={({ item }) => {
                    const isRepeated = item.repeated > 0;
                    const isCollected = item.isCollected && !isRepeated;

                    return (
                        <View style={[styles.sticker, isCollected && styles.stickerCollected]}>
                            <Text style={[styles.stickerText, !item.isCollected && styles.stickerTextMissing]}>
                                {item.code}
                            </Text>

                            {isRepeated &&
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {item.repeated}
                                    </Text>
                                </View>
                            }
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "92%",
        maxWidth: 560,
        backgroundColor: "#30302E",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#65645F",
        overflow: "hidden",
    },
    header: {
        backgroundColor: "#0A2E6F",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    countryBlock: {
        flexDirection: "row",
        alignItems: "center",
    },
    countryCode: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "900",
        letterSpacing: 0.4,
        marginRight: 10,
    },
    countryName: {
        color: "#DDE6FA",
        fontSize: 14,
        fontWeight: "600",
    },
    progressBlock: {
        alignItems: "flex-end",
    },
    progressText: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "900",
        lineHeight: 30,
    },
    progressTrack: {
        marginTop: 4,
        width: 86,
        height: 8,
        borderRadius: 999,
        backgroundColor: "#3B5A8F",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
    },
    gridContent: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 14,
    },
    gridRow: {
        justifyContent: "space-between",
        marginBottom: 10,
    },
    sticker: {
        width: "19%",
        height: 46,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#65645F",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    stickerCollected: {
        borderColor: "#2ABA57",
        backgroundColor: "#E9F7EE",
    },
    stickerText: {
        color: "#132A45",
        fontSize: 17,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    stickerTextMissing: {
        color: "#6D7480",
    },
    badge: {
        position: "absolute",
        right: 0,
        top: 0,
        minWidth: 15,
        height: 12,
        borderTopRightRadius: 7,
        backgroundColor: "#E59B1D",
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "900",
    },
});
