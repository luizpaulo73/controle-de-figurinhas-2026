import type { Frame } from "react-native-vision-camera";
import { VisionCameraProxy } from "react-native-vision-camera";

const scanOCRPlugin = VisionCameraProxy.initFrameProcessorPlugin("scanOCR", {});

export function scanOCR(frame: Frame): string {
    "worklet";

    if (scanOCRPlugin == null) {
        return "";
    }

    const pluginResult = scanOCRPlugin.call(frame);
    return typeof pluginResult === "string" ? pluginResult : "";
}
