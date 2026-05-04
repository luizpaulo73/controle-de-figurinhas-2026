import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    Vibration,
    useWindowDimensions,
    View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
    Camera,
    runAtTargetFps,
    useCameraDevice,
    useCameraFormat,
    useCameraPermission,
    useFrameProcessor,
    CameraPosition,
} from "react-native-vision-camera";
import { useRunOnJS, useSharedValue } from "react-native-worklets-core";
import { Zap, RotateCw } from "lucide-react-native";

import {
    addSticker,
    compareStickerWithAlbum,
    initDB,
    seedStickers,
} from "../../database/sql";
import { extractStickerCodes } from "./ocrCodeParser";
import { scanOCR } from "./scanOCR";

type DetectedSticker = {
    code: string;
    owned: number;
};

export function StickerScanner() {
    const [cameraPosition, setCameraPosition] =
        useState<CameraPosition>("back");
    const [torchEnabled, setTorchEnabled] = useState(false);
    const device = useCameraDevice(cameraPosition);
    const format = useCameraFormat(device, [{ fps: 30 }]);
    const { hasPermission, requestPermission } = useCameraPermission();
    const [detectedSticker, setDetectedSticker] =
        useState<DetectedSticker | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState<string>(
        "Aponte a câmera para uma figurinha.",
    );
    const [isCameraActive, setIsCameraActive] = useState(false);
    const blockedCodeRef = useRef<string | null>(null);
    const lastProcessedAt = useSharedValue(0);

    useFocusEffect(
        useCallback(() => {
            setIsCameraActive(true);
            return () => {
                setIsCameraActive(false);
                setTorchEnabled(false);
            };
        }, []),
    );

    const handleToggleFlash = useCallback(() => {
        setTorchEnabled((prev) => !prev);
    }, []);

    const handleFlipCamera = useCallback(() => {
        setCameraPosition((prev) => (prev === "back" ? "front" : "back"));
    }, []);

    const handleDetected = useCallback(
        (recognizedText: string) => {
            const nextCodes = extractStickerCodes(recognizedText);
            if (nextCodes.length === 0) return;

            const code = nextCodes[0];
            if (blockedCodeRef.current === code) {
                return;
            }

            if (detectedSticker?.code === code) {
                return;
            }

            const comparison = compareStickerWithAlbum(code);

            blockedCodeRef.current = null;
            setFeedbackMessage(
                comparison.isOwned
                    ? `Figurinha encontrada: ${code} (já está no álbum)`
                    : `Figurinha nova detectada: ${code}`,
            );

            if (!comparison.isOwned) {
                Vibration.vibrate([0, 40, 60, 40]);
            }

            setDetectedSticker({
                code,
                owned: comparison.owned,
            });
        },
        [detectedSticker],
    );

    const handleAddSticker = useCallback((code: string) => {
        addSticker(code);
        setFeedbackMessage(`Adicionada ao álbum: ${code}`);
        blockedCodeRef.current = code;
        setDetectedSticker(null);

        // Limpar bloqueio após 1 segundo
        setTimeout(() => {
            blockedCodeRef.current = null;
        }, 1000);
    }, []);

    const handleDismissSticker = useCallback((code: string) => {
        setFeedbackMessage(`Recusada: ${code}`);
        blockedCodeRef.current = code;
        setDetectedSticker(null);

        // Limpar bloqueio após 1 segundo
        setTimeout(() => {
            blockedCodeRef.current = null;
        }, 1000);
    }, []);

    const runHandleDetected = useRunOnJS(handleDetected, [handleDetected]);
    const { width, height } = useWindowDimensions();

    const frameProcessor = useFrameProcessor(
        (frame) => {
            "worklet";

            const now = Date.now();
            if (now - lastProcessedAt.value < 300) {
                return;
            }
            lastProcessedAt.value = now;

            runAtTargetFps(3, () => {
                "worklet";
                const text = scanOCR(frame);
                runHandleDetected(text);
            });
        },
        [runHandleDetected, lastProcessedAt],
    );

    if (!hasPermission) {
        return (
            <View style={styles.centeredState}>
                <Text style={styles.stateTitle}>
                    Permissão de câmera necessária
                </Text>
                <Text style={styles.stateMessage}>
                    Toque no botão para liberar o scanner em tempo real.
                </Text>
                <Pressable
                    style={styles.primaryButton}
                    onPress={requestPermission}
                >
                    <Text style={styles.primaryButtonText}>
                        Permitir câmera
                    </Text>
                </Pressable>
            </View>
        );
    }

    if (device == null) {
        return (
            <View style={styles.centeredState}>
                <ActivityIndicator size="large" color="#C9A85B" />
                <Text style={styles.stateMessage}>Carregando câmera...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View
                style={[
                    StyleSheet.absoluteFill,
                    cameraPosition === "front" && {
                        transform: [{ scaleX: -1 }],
                    },
                ]}
            >
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    format={format}
                    isActive={isCameraActive}
                    frameProcessor={frameProcessor}
                    fps={30}
                    pixelFormat="yuv"
                    torch={torchEnabled ? "on" : "off"}
                />
            </View>

            {/* Botões de controle */}
            <View style={styles.controlsContainer}>
                <Pressable
                    style={[
                        styles.controlButton,
                        torchEnabled && styles.controlButtonActive,
                    ]}
                    onPress={handleToggleFlash}
                >
                    <Zap
                        size={24}
                        color={torchEnabled ? "#FFD700" : "#FFFFFF"}
                    />
                </Pressable>

                <Pressable
                    style={styles.controlButton}
                    onPress={handleFlipCamera}
                >
                    <RotateCw size={24} color="#FFFFFF" />
                </Pressable>
            </View>

            <View style={styles.overlayPanel}>
                <Text style={styles.overlayTitle}>Detectadas</Text>
                <Text style={styles.feedbackText}>{feedbackMessage}</Text>

                {detectedSticker == null ? (
                    <Text style={styles.overlayEmpty}>
                        Nenhuma figurinha ativa no momento.
                    </Text>
                ) : (
                    <View style={styles.detectedRow}>
                        <View style={styles.detectedInfo}>
                            <Text style={styles.detectedCode}>
                                {detectedSticker.code}
                            </Text>
                            <Text style={styles.detectedStatus}>
                                {detectedSticker.owned > 0
                                    ? "Já está no álbum"
                                    : "Ainda não está no álbum"}
                            </Text>
                        </View>

                        {detectedSticker.owned === 0 && (
                            <View style={styles.actionRow}>
                                <Pressable
                                    style={[
                                        styles.actionButton,
                                        styles.addButton,
                                    ]}
                                    onPress={() =>
                                        handleAddSticker(detectedSticker.code)
                                    }
                                >
                                    <Text style={styles.actionButtonText}>
                                        Adicionar
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[
                                        styles.actionButton,
                                        styles.cancelButton,
                                    ]}
                                    onPress={() =>
                                        handleDismissSticker(
                                            detectedSticker.code,
                                        )
                                    }
                                >
                                    <Text style={styles.actionButtonText}>
                                        Cancelar
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1B1B19",
    },
    centeredState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: "#1B1B19",
        gap: 12,
    },
    stateTitle: {
        color: "#F6F5F2",
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
    },
    stateMessage: {
        color: "#D7D5CB",
        fontSize: 15,
        textAlign: "center",
    },
    primaryButton: {
        backgroundColor: "#C9A85B",
        borderRadius: 10,
        paddingHorizontal: 18,
        paddingVertical: 12,
    },
    primaryButtonText: {
        color: "#1F1E1A",
        fontWeight: "700",
        fontSize: 14,
    },
    controlsContainer: {
        position: "absolute",
        top: 16,
        right: 16,
        paddingTop: 20,
        gap: 12,
        zIndex: 10,
    },
    controlButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    controlButtonActive: {
        backgroundColor: "rgba(255, 215, 0, 0.2)",
        borderColor: "rgba(255, 215, 0, 0.5)",
    },
    guideArea: {
        position: "absolute",
        width: "76%",
        aspectRatio: 1.85,
        left: "12%",
        top: "34%",
        borderColor: "#F8F7F2",
        borderWidth: 2,
        borderRadius: 18,
        backgroundColor: "rgba(255, 255, 255, 0.04)",
    },
    overlayPanel: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 24,
        borderRadius: 14,
        padding: 14,
        backgroundColor: "rgba(17, 17, 16, 0.84)",
        borderWidth: 1,
        borderColor: "rgba(201, 168, 91, 0.65)",
        gap: 10,
    },
    overlayTitle: {
        color: "#EED9A0",
        fontSize: 13,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    feedbackText: {
        color: "#D7D5CB",
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
    overlayEmpty: {
        color: "#FCFBF7",
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 22,
    },
    detectedRow: {
        borderRadius: 12,
        padding: 12,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
        gap: 10,
    },
    detectedInfo: {
        gap: 2,
    },
    detectedCode: {
        color: "#FCFBF7",
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: 0.8,
    },
    detectedStatus: {
        color: "#D7D5CB",
        fontSize: 13,
        fontWeight: "600",
    },
    actionRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    actionButton: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minWidth: 84,
        alignItems: "center",
    },
    addButton: {
        backgroundColor: "#2F7D32",
    },
    cancelButton: {
        backgroundColor: "#5A5A55",
    },
    actionButtonText: {
        color: "#FCFBF7",
        fontSize: 13,
        fontWeight: "800",
    },
});
