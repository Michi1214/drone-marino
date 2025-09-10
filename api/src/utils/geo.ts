export type Pt = { lat: number; lon: number };
export type Rect = { minLat: number; maxLat: number; minLon: number; maxLon: number };

export function rectFrom(lat1: number, lon1: number, lat2: number, lon2: number): Rect {
  return {
    minLat: Math.min(lat1, lat2),
    maxLat: Math.max(lat1, lat2),
    minLon: Math.min(lon1, lon2),
    maxLon: Math.max(lon1, lon2)
  };
}
export function pointInRect(p: Pt, r: Rect): boolean {
  return p.lat >= r.minLat && p.lat <= r.maxLat && p.lon >= r.minLon && p.lon <= r.maxLon;
}
function ccw(A: Pt, B: Pt, C: Pt) {
  return (C.lat - A.lat) * (B.lon - A.lon) > (B.lat - A.lat) * (C.lon - A.lon);
}
export function segmentsIntersect(a1: Pt, a2: Pt, b1: Pt, b2: Pt): boolean {
  return ccw(a1, b1, b2) !== ccw(a2, b1, b2) && ccw(a1, a2, b1) !== ccw(a1, a2, b2);
}
export function segmentIntersectsRect(p1: Pt, p2: Pt, r: Rect): boolean {
  // lati del rettangolo
  const tl = { lat: r.maxLat, lon: r.minLon };
  const tr = { lat: r.maxLat, lon: r.maxLon };
  const bl = { lat: r.minLat, lon: r.minLon };
  const br = { lat: r.minLat, lon: r.maxLon };
  return (
    segmentsIntersect(p1, p2, tl, tr) ||
    segmentsIntersect(p1, p2, tr, br) ||
    segmentsIntersect(p1, p2, br, bl) ||
    segmentsIntersect(p1, p2, bl, tl)
  );
}
export function routeHitsAnyRect(route: Pt[], rects: Rect[]): boolean {
  if (route.length < 2) return false;
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i], b = route[i + 1];
    for (const r of rects) {
      if (pointInRect(a, r) || pointInRect(b, r) || segmentIntersectsRect(a, b, r)) return true;
    }
  }
  return false;
}
