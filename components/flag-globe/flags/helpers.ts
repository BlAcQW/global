/**
 * Shared canvas primitives for the procedural flag painters (PRD §8, §12).
 * Painters fill the rect (0,0)–(w,h); the caller clips to the country silhouette
 * and stretches the result to the country bounding box, so emblems are stylised
 * to read at globe scale rather than being pixel-accurate.
 */

export function rect(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/** Equal horizontal bands, top → bottom. */
export function bandsH(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: string[]
): void {
  const bh = h / colors.length;
  colors.forEach((c, i) => rect(ctx, c, 0, i * bh, w, bh + 1));
}

/** Equal vertical bands, left → right. */
export function bandsV(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: string[]
): void {
  const bw = w / colors.length;
  colors.forEach((c, i) => rect(ctx, c, i * bw, 0, bw + 1, h));
}

export function disc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

export function ringStroke(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  lineWidth: number
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

/** Five-pointed star centred at (cx,cy), outer radius r, rotation in radians. */
export function star5(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  rotation = -Math.PI / 2
): void {
  const inner = r * 0.382;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = rotation + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

/** Crescent (waxing) drawn by subtracting an offset disc. */
export function crescent(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  bg: string
): void {
  disc(ctx, cx, cy, r, color);
  disc(ctx, cx + r * 0.38, cy, r * 0.82, bg);
}

/** Sun-of-May style disc: solid centre + alternating straight/wavy rays. */
export function sunRays(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  color: string,
  count = 16
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, rInner * 0.18);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * rInner, cy + Math.sin(a) * rInner);
    ctx.lineTo(cx + Math.cos(a) * rOuter, cy + Math.sin(a) * rOuter);
    ctx.stroke();
  }
  disc(ctx, cx, cy, rInner, color);
}

/** Spoked wheel (Ashoka Chakra stand-in). */
export function chakra(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  spokes = 24
): void {
  ringStroke(ctx, cx, cy, r, color, Math.max(1, r * 0.09));
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, r * 0.05);
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }
  disc(ctx, cx, cy, r * 0.12, color);
}

/** Simple shield outline filled with `color`, centred at (cx,cy). */
export function shield(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy + h / 6);
  ctx.quadraticCurveTo(cx, cy + h / 2, cx - w / 2, cy + h / 6);
  ctx.closePath();
  ctx.fill();
}

/** Draw a straight line (helper for saltires/crosses). */
export function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
