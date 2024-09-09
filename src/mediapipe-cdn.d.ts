// src/mediapipe-cdn.d.ts

declare module "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3" {
  export class GestureRecognizer {
    constructor(options: any);

    static HAND_CONNECTIONS: { start: number; end: number }[]; // Array of connection pairs between landmarks

    static createFromOptions(
      fileset: any,
      options: {
        baseOptions: {
          modelAssetPath: string;
          delegate?: "GPU" | "CPU";
        };
        runningMode?: "IMAGE" | "VIDEO";
        numHands?: number;
        min_hand_detection_confidence?: number;
        custom_gestures_classifier_options: {
          scoreThreshold: number
        };
      }
    ): Promise<GestureRecognizer>;

    recognize(
      image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
    ): GestureRecognizerResult;

    recognizeForVideo(
      video: HTMLVideoElement,
      nowInMs: number
    ): GestureRecognizerResult;

    setOptions(options: {
      baseOptions?: {
        modelAssetPath?: string;
        delegate?: "GPU" | "CPU";
      };
      runningMode?: "IMAGE" | "VIDEO";
      numHands?: number;
      min_hand_detection_confidence?: number;
    }): Promise<void>;
  }

  export class FilesetResolver {
    static forVisionTasks(path: string): Promise<any>;
  }

  export class DrawingUtils {
    constructor(context: CanvasRenderingContext2D);

    drawConnectors(
      landmarks: { x: number; y: number }[],
      connections: { start: number; end: number }[],
      options: { color?: string; lineWidth?: number }
    ): void;

    drawLandmarks(
      landmarks: { x: number; y: number }[],
      options: { color?: string; lineWidth?: number }
    ): void;
  }

  export type GestureRecognizerResult = {
    gestures: Array<{ categoryName: string; score: number }[]>;
    landmarks: Array<{ x: number; y: number; z?: number }[]>;
    handednesses: Array<{ displayName: string; score: number }[]>;
  };
}
