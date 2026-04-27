import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import StickerSection from "../../components/StickerSection/StickerSection";
import {
    addSticker,
    getAlbumTeamSections,
    removeSticker,
} from "../../database/sql";
import { AlbumTeamSection } from "../../types/sqlAlbum";

export default function AlbumPage() {
    const [sections, setSections] = useState<AlbumTeamSection[]>(() =>
        getAlbumTeamSections(),
    );

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
        <View style={styles.container}>
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
                            onAddSticker={handleAddSticker}
                            onRemoveSticker={handleRemoveSticker}
                        />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#262624",
        paddingHorizontal: 10,
    },
    listContent: {
        paddingTop: 12,
        paddingBottom: 24,
    },
    sectionItem: {
        marginBottom: 12,
    },
});
