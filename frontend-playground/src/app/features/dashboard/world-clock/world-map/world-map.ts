import { Component, computed, inject, input, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type Position = [number, number];
type Ring = Position[];
interface Feature {
  properties: { iso_a2: string | null; name: string };
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: Ring[] | Ring[][] };
}
interface FeatureCollection {
  features: Feature[];
}

interface MapShape {
  code: string | null;
  name: string;
  d: string;
  shade: number;
}

interface TimeZoneBand {
  offset: number; // whole-hour UTC offset (e.g. +7)
  x: number; // SVG x of the band centre (for the labels)
  lineX: number; // SVG x of the band's western boundary (for the gridline)
  time: string; // current HH:mm at this offset
  label: string; // e.g. "UTC+7"
}

const VIEW_W = 1000;
const VIEW_H = 500;
const HOVER_DEBOUNCE_MS = 100;

@Component({
  selector: 'app-world-map',
  imports: [],
  templateUrl: './world-map.html',
  styleUrl: './world-map.css'
})
export class WorldMap {
  private readonly http = inject(HttpClient);

  // Codes the user has added — highlighted brighter on the map.
  readonly selectedCodes = input<string[]>([]);
  // Timezone-grid overlay: vertical UTC bands, each labelled with its current time.
  readonly showGrid = input<boolean>(false);
  // The shared "now" instant (from ClockService) the grid times derive from.
  readonly now = input<Date>(new Date());
  // Emits the hovered country code (debounced), or null on mouse-out.
  readonly hover = output<string | null>();
  // Emits a code when a country is clicked (quick "add from map").
  readonly select = output<string>();

  protected readonly viewBox = `0 0 ${VIEW_W} ${VIEW_H}`;
  protected readonly shapes = signal<MapShape[]>([]);
  protected readonly hovered = signal<string | null>(null);

  private readonly selectedSet = computed(
    () => new Set(this.selectedCodes().map((c) => c.toUpperCase()))
  );

  protected readonly bands = computed<TimeZoneBand[]>(() => {
    if (!this.showGrid()) {
      return [];
    }
    const nowMs = this.now().getTime();
    const out: TimeZoneBand[] = [];
    for (let offset = -12; offset <= 11; offset++) {
      const centerLon = offset * 15;
      const local = new Date(nowMs + offset * 3_600_000);
      const hh = String(local.getUTCHours()).padStart(2, '0');
      const mm = String(local.getUTCMinutes()).padStart(2, '0');
      out.push({
        offset,
        x: ((centerLon + 180) / 360) * VIEW_W,
        lineX: ((centerLon - 7.5 + 180) / 360) * VIEW_W,
        time: `${hh}:${mm}`,
        label: `UTC${offset >= 0 ? '+' : ''}${offset}`
      });
    }
    return out;
  });

  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.http
      .get<FeatureCollection>('/world.geojson')
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (geo) => this.shapes.set(this.buildShapes(geo)),
        error: () => this.shapes.set([])
      });
  }

  protected isSelected(code: string | null): boolean {
    return !!code && this.selectedSet().has(code);
  }

  protected onEnter(shape: MapShape): void {
    this.hovered.set(shape.code);
    this.scheduleHover(shape.code);
  }

  protected onLeave(): void {
    this.hovered.set(null);
    this.scheduleHover(null);
  }

  protected onClick(shape: MapShape): void {
    if (shape.code) {
      this.select.emit(shape.code);
    }
  }

  private scheduleHover(code: string | null): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }
    this.hoverTimer = setTimeout(() => this.hover.emit(code), HOVER_DEBOUNCE_MS);
  }

  private buildShapes(geo: FeatureCollection): MapShape[] {
    return geo.features
      .map((f) => {
        const code = f.properties.iso_a2 ? f.properties.iso_a2.toUpperCase() : null;
        const polygons =
          f.geometry.type === 'Polygon'
            ? [f.geometry.coordinates as Ring[]]
            : (f.geometry.coordinates as Ring[][]);
        const d = polygons.map((rings) => rings.map((r) => this.ringToPath(r)).join(' ')).join(' ');
        return { code, name: f.properties.name, d, shade: this.shadeFor(code ?? f.properties.name) };
      })
      .filter((s) => s.d.length > 0);
  }

  private ringToPath(ring: Ring): string {
    if (ring.length === 0) {
      return '';
    }
    const segs = ring.map(([lon, lat], i) => {
      const x = ((lon + 180) / 360) * VIEW_W;
      const y = ((90 - lat) / 180) * VIEW_H;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return `${segs.join(' ')}Z`;
  }

  private shadeFor(key: string): number {
    let h = 0;
    for (let i = 0; i < key.length; i++) {
      h = (h * 31 + key.charCodeAt(i)) >>> 0;
    }
    return h % 5;
  }
}
