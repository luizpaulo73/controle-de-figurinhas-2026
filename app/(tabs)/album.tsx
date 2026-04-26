import { StyleSheet, View } from "react-native";
import StickerSection from "../../components/StickerSection/StickerSection";

export default function AlbumPage() {

    return (
        <View style={styles.container}>
            <StickerSection />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#262624",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
    },
});