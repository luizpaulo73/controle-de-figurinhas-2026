import { Slot } from "expo-router";
import { useEffect } from "react";

import { initDB } from "../database/sql";

export default function RootLayout() {
	useEffect(() => {
		initDB();
	}, []);

	return <Slot />;
}