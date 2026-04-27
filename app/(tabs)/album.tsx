import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StickerSection from "../../components/StickerSection/StickerSection";
import { addSticker, getAlbumTeamSections, removeSticker } from "../../database/sql";
import { AlbumTeamSection } from "../../types/sqlAlbum";

export default function AlbumPage() {
    const [sections, setSections] = useState<AlbumTeamSection[]>(() =>
        getAlbumTeamSections(),
    );
    const [hideCollectedStickers, setHideCollectedStickers] = useState<boolean>(false);

    const loadAlbumSections = useCallback(() => {
        setSections(getAlbumTeamSections());
    }, []);

    const handleAddSticker = useCallback(
        (code: string) => {
            addSticker(code);
            loadAlbumSections();
        },
        [loadAlbumSections],
    );

    const handleRemoveSticker = useCallback(
        (code: string) => {
            removeSticker(code);
            loadAlbumSections();
        },
        [loadAlbumSections],
    );

    useFocusEffect(
        useCallback(() => {
            loadAlbumSections();
        }, [loadAlbumSections]),
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <View style={styles.container}>
                <View style={styles.headerCard}>
                    <Image
                        source={require("../../assets/world-cup.png")}
                        style={styles.headerLogo}
                        resizeMode="contain"
                    />

                    <View style={styles.headerTextBlock}>
                        <Text style={styles.headerOverline}>PANINI</Text>
                        <Text style={styles.headerTitle}>Copa do Mundo 2026</Text>
                        <Text style={styles.headerSubtitle}>Figurinhas</Text>
                    </View>
                </View>

                <View style={styles.filterSegment}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Mostrar todas as figurinhas"
                        onPress={() => setHideCollectedStickers(false)}
                        style={[
                            styles.filterSegmentButton,
                            !hideCollectedStickers && styles.filterSegmentButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.filterSegmentButtonText,
                                !hideCollectedStickers && styles.filterSegmentButtonTextActive,
                            ]}
                        >
                            Todas
                        </Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Mostrar somente figurinhas faltantes"
                        onPress={() => setHideCollectedStickers(true)}
                        style={[
                            styles.filterSegmentButton,
                            hideCollectedStickers && styles.filterSegmentButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.filterSegmentButtonText,
                                hideCollectedStickers && styles.filterSegmentButtonTextActive,
                            ]}
                        >
                            Faltantes
                        </Text>
                    </Pressable>
                </View>

                <FlatList
                    data={sections}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.sectionItem}>
                            <StickerSection
                                teamCode={item.teamCode}
                                countryName={item.countryName}
                                countryRgb={item.countryRgb}
                                flagEmoji={item.flagEmoji}
                                groupName={item.groupName}
                                stickers={item.stickers}
                                hideCollectedStickers={hideCollectedStickers}
                                onAddSticker={handleAddSticker}
                                onRemoveSticker={handleRemoveSticker}
                            />
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#262624",
    },
    container: {
        flex: 1,
        backgroundColor: "#262624",
        paddingHorizontal: 10,
    },
    headerCard: {
        marginTop: 4,
        marginBottom: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#65645F",
        backgroundColor: "#30302E",
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    headerLogo: {
        width: 72,
        height: 72,
        marginRight: 10,
    },
    headerTextBlock: {
        flex: 1,
    },
    headerOverline: {
        color: "#C9A85B",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "900",
        lineHeight: 26,
    },
    headerSubtitle: {
        color: "#D7D4CA",
        fontSize: 16,
        fontWeight: "700",
    },
    listContent: {
        paddingTop: 2,
        paddingBottom: 24,
    },
    filterSegment: {
        borderWidth: 1,
        borderColor: "#65645F",
        backgroundColor: "#30302E",
        borderRadius: 10,
        padding: 4,
        marginBottom: 10,
        flexDirection: "row",
        gap: 6,
    },
    filterSegmentButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    filterSegmentButtonActive: {
        backgroundColor: "#3A372D",
        borderWidth: 1,
        borderColor: "#C9A85B",
    },
    filterSegmentButtonText: {
        color: "#D7D4CA",
        fontSize: 13,
        fontWeight: "700",
    },
    filterSegmentButtonTextActive: {
        color: "#FFFFFF",
    },
    sectionItem: {
        marginBottom: 12,
    },
});
