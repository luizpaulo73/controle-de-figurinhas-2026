import { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Image,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getProgressStats, ProgressStats } from "../../database/sql";

const typeLabels: Record<string, string> = {
    INTRO: "Figurinha 00 + Intro",
    HOST: "País Anfitrião",
    TEAM: "Seleções",
    FWC: "Especiais FWC",
    COCA: "Coca-Cola",
};

const typeColors: Record<string, string> = {
    INTRO: "#C9A85B",
    HOST: "#FF6B6B",
    TEAM: "#4ECDC4",
    FWC: "#FFE66D",
    COCA: "#FF4757",
};

function DonutChart({
    collected,
    total,
    percentage,
}: {
    collected: number;
    total: number;
    percentage: number;
}) {
    const percentageStr = percentage.toFixed(1);
    const size = 280;
    const radius = 100;
    const strokeWidth = 24;

    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <View style={styles.chartContainer}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Círculo de fundo */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                />

                {/* Círculo de progresso */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#C9A85B"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    rotation="-90"
                    originX={size / 2}
                    originY={size / 2}
                />
            </Svg>

            {/* Texto centrado */}
            <View style={styles.chartText}>
                <Text style={styles.percentageText}>{percentageStr}%</Text>
                <Text style={styles.collectedText}>
                    {collected} de {total}
                </Text>
            </View>
        </View>
    );
}

function ProgressTypeBar({
    type,
    collected,
    total,
    percentage,
}: {
    type: string;
    collected: number;
    total: number;
    percentage: number;
}) {
    return (
        <View style={styles.typeBarContainer}>
            <View style={styles.typeBarHeader}>
                <Text style={styles.typeLabel}>{typeLabels[type] || type}</Text>
                <Text style={styles.typePercentage}>
                    {percentage.toFixed(1)}%
                </Text>
            </View>
            <View style={styles.barBackground}>
                <View
                    style={[
                        styles.barFill,
                        {
                            width: `${percentage}%`,
                            backgroundColor: typeColors[type] || "#C9A85B",
                        },
                    ]}
                />
            </View>
            <Text style={styles.typeCount}>
                {collected} / {total}
            </Text>
        </View>
    );
}

export default function ProgressPage() {
    const [stats, setStats] = useState<ProgressStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = useCallback(() => {
        try {
            const data = getProgressStats();
            setStats(data);
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [loadStats]),
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            loadStats();
            setRefreshing(false);
        }, 300);
    }, [loadStats]);

    if (!stats) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.container}>
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
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

            {/* Gráfico de progresso geral */}
            <View style={styles.section}>
                <DonutChart
                    collected={stats.collected}
                    total={stats.total}
                    percentage={parseFloat(stats.percentage.toFixed(1))}
                />
            </View>

            {/* Barra de progresso detalhada */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Progresso por Categoria</Text>
                <View style={styles.typesList}>
                    {stats.byType.map((item) => (
                        <ProgressTypeBar
                            key={item.type}
                            type={item.type}
                            collected={item.collected}
                            total={item.total}
                            percentage={item.percentage}
                        />
                    ))}
                </View>
            </View>

            {/* Estatísticas */}
            <View style={styles.section}>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{stats.collected}</Text>
                        <Text style={styles.statLabel}>Coletadas</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>
                            {stats.total - stats.collected}
                        </Text>
                        <Text style={styles.statLabel}>Faltam</Text>
                    </View>
                </View>
            </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#1B1B19",
    },
    container: {
        flex: 1,
        backgroundColor: "#1B1B19",
    },
    headerCard: {
        marginTop: 4,
        marginBottom: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#65645F",
        backgroundColor: "#30302E",
        paddingHorizontal: 12,
        marginHorizontal: 10,
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
    title: {
        color: "#F6F5F2",
        fontSize: 28,
        fontWeight: "800",
    },
    loadingText: {
        color: "#D7D5CB",
        fontSize: 16,
        textAlign: "center",
        marginTop: 40,
    },
    section: {
        marginHorizontal: 16,
        marginVertical: 20,
    },
    chartContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
    },
    chartText: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
    percentageText: {
        color: "#C9A85B",
        fontSize: 42,
        fontWeight: "800",
    },
    collectedText: {
        color: "#D7D5CB",
        fontSize: 14,
        marginTop: 8,
    },
    sectionTitle: {
        color: "#EED9A0",
        fontSize: 16,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 16,
    },
    typesList: {
        gap: 16,
    },
    typeBarContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    typeBarHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    typeLabel: {
        color: "#F6F5F2",
        fontSize: 14,
        fontWeight: "600",
    },
    typePercentage: {
        color: "#C9A85B",
        fontSize: 14,
        fontWeight: "700",
    },
    barBackground: {
        height: 12,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: 6,
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: 6,
    },
    typeCount: {
        color: "#D7D5CB",
        fontSize: 12,
    },
    statsGrid: {
        flexDirection: "row",
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "rgba(201, 168, 91, 0.1)",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(201, 168, 91, 0.3)",
    },
    statNumber: {
        color: "#C9A85B",
        fontSize: 24,
        fontWeight: "800",
    },
    statLabel: {
        color: "#D7D5CB",
        fontSize: 12,
        marginTop: 4,
    },
});
