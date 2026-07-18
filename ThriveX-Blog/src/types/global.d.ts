interface Window {
  _hmt?: unknown[];
}

// 高德地图 SDK 最小类型声明（仅覆盖本项目使用的方法）
declare namespace AMap {
  class LngLat {
    constructor(lng: number, lat: number);
  }

  class Pixel {
    constructor(x: number, y: number);
  }

  class Map {
    constructor(container: string | HTMLElement, opts?: Record<string, unknown>);
    on(event: string, handler: (...args: unknown[]) => void): void;
    setCenter(center: LngLat | [number, number] | number[]): void;
    setZoom(zoom: number): void;
    destroy(): void;
  }

  class Marker {
    constructor(opts?: Record<string, unknown>);
    on(event: string, handler: (...args: unknown[]) => void): void;
    getPosition(): LngLat;
  }

  class InfoWindow {
    constructor(opts?: Record<string, unknown>);
    setContent(content: string): void;
    open(map: Map, position: LngLat | [number, number] | number[]): void;
    close(): void;
    destroy(): void;
  }
}