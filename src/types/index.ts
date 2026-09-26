export interface Point {
  x: number;
  y: number;
}

export interface QuadPoints {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface ShadowConfig {
  opacity: number;        // 0.0 to 1.0
  blurRadius: number;     // 2 to 60 px
  elevation: number;      // 0 to 50 px
  lightAngleDeg: number;  // 0 to 360 deg
  ambientOcclusion: number; // 0.0 to 1.0
}

export interface SegmentationParams {
  sensitivity: number;    // 0.1 to 0.6
  protectFringes: boolean;
  edgeFeathering: number;
}

export interface HistoryState {
  quad: QuadPoints;
  shadow: ShadowConfig;
}

export interface SampleAsset {
  id: string;
  nameFa: string;
  url: string;
  type: 'carpet' | 'room';
}
