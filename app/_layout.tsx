import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import { initDB, seedStickers } from "../database/sql";

export default function RootLayout() {
    useLayoutEffect(() => {
        initDB();
        seedStickers();
    }, []);

    return (
        <View style={styles.root}>
            <StatusBar style="light" backgroundColor="#262624" translucent={false} />
            <Stack initialRouteName="(tabs)">
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#262624",
    },
});