import { Slot } from "expo-router";
import { useLayoutEffect } from "react";
import { initDB, seedStickers } from "../database/sql";

export default function RootLayout() {
    useLayoutEffect(() => {
        initDB();
        seedStickers();
    }, []);

    return <Slot />;
}