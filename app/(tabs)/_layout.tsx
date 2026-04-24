import { Tabs } from "expo-router";
import { BarChart3, Copy } from "lucide-react-native";
import { Grid2x2, Search } from "lucide-react-native/icons";
import { StyleSheet, View } from "react-native";

export default function TabsLayout() {
    return (
        <View style={styles.container}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarActiveTintColor: "#00BAFF",
                    tabBarInactiveTintColor: "#C2C0B6",
                }}
            >
                <Tabs.Screen
                    name="album"
                    options={{
                        title: "Álbum",
                        tabBarIcon: ({ color, size }) => <Grid2x2 size={size} color={color} />
                    }}
                />

                <Tabs.Screen
                    name="faltantes"
                    options={{
                        title: "Faltantes",
                        tabBarIcon: ({ color, size }) => <Search size={size} color={color} />
                    }}
                />

                <Tabs.Screen
                    name="adicionar"
                    options={{
                        title: "Adicionar",
                        tabBarIcon: ({ color, size }) => <Search size={size} color={color} />
                    }}
                />

                <Tabs.Screen
                    name="repetidas"
                    options={{
                        title: "Repetidas",
                        tabBarIcon: ({ color, size }) => <Copy size={size} color={color} />
                    }}
                />

                <Tabs.Screen
                    name="progresso"
                    options={{
                        title: "Progresso",
                        tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />
                    }}
                />
            </Tabs>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#262624",
    },
    tabBar: {
        backgroundColor: "#30302E",
        width: "90%",
        alignSelf: "center",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "#65645F",
        height: 70,
        paddingTop: 10,
    },
});
