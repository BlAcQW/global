import type { FlagPainter } from "../types";
import { bandsV, rect, disc, star5, sunRays } from "./helpers";

export const unitedStates: FlagPainter = (ctx, w, h) => {
  // 13 stripes
  const sh = h / 13;
  for (let i = 0; i < 13; i++) {
    rect(ctx, i % 2 === 0 ? "#b22234" : "#ffffff", 0, i * sh, w, sh + 1);
  }
  // canton
  const cw = w * 0.4;
  const ch = sh * 7;
  rect(ctx, "#3c3b6e", 0, 0, cw, ch);
  // simplified 5x4 star grid
  const cols = 5;
  const rows = 4;
  const r = Math.min(cw / cols, ch / rows) * 0.32;
  for (let ry = 0; ry < rows; ry++) {
    for (let rx = 0; rx < cols; rx++) {
      const x = (cw / cols) * (rx + 0.5);
      const y = (ch / rows) * (ry + 0.5);
      star5(ctx, x, y, r, "#ffffff");
    }
  }
};

export const mexico: FlagPainter = (ctx, w, h) => {
  bandsV(ctx, w, h, ["#006847", "#ffffff", "#ce1126"]);
  // stylised eagle-on-cactus emblem
  disc(ctx, w / 2, h / 2, Math.min(w, h) * 0.1, "#7a5230");
  rect(ctx, "#3a6b35", w / 2 - w * 0.015, h / 2, w * 0.03, h * 0.14);
};

export const brazil: FlagPainter = (ctx, w, h) => {
  rect(ctx, "#009c3b", 0, 0, w, h);
  // yellow rhombus
  ctx.fillStyle = "#ffdf00";
  ctx.beginPath();
  ctx.moveTo(w / 2, h * 0.1);
  ctx.lineTo(w * 0.9, h / 2);
  ctx.lineTo(w / 2, h * 0.9);
  ctx.lineTo(w * 0.1, h / 2);
  ctx.closePath();
  ctx.fill();
  // blue globe
  disc(ctx, w / 2, h / 2, Math.min(w, h) * 0.22, "#002776");
  // white banner
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(1, h * 0.03);
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.62, Math.min(w, h) * 0.2, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  // a few stars
  const r = Math.min(w, h) * 0.02;
  for (const [fx, fy] of [
    [0.5, 0.42],
    [0.44, 0.55],
    [0.56, 0.55],
    [0.5, 0.6],
  ] as [number, number][]) {
    star5(ctx, w * fx, h * fy, r, "#ffffff");
  }
};

export const argentina: FlagPainter = (ctx, w, h) => {
  rect(ctx, "#74acdf", 0, 0, w, h / 3);
  rect(ctx, "#ffffff", 0, h / 3, w, h / 3);
  rect(ctx, "#74acdf", 0, (2 * h) / 3, w, h / 3);
  const r = Math.min(w, h) * 0.12;
  sunRays(ctx, w / 2, h / 2, r * 0.55, r, "#f6b40e", 16);
};
