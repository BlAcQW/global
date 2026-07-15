import type { FlagPainter } from "../types";
import { bandsH, bandsV, rect, star5, shield, disc, line } from "./helpers";

export const ghana: FlagPainter = (ctx, w, h) => {
  bandsH(ctx, w, h, ["#ce1126", "#fcd116", "#006b3f"]);
  star5(ctx, w / 2, h / 2, Math.min(w, h) * 0.17, "#000000");
};

export const nigeria: FlagPainter = (ctx, w, h) => {
  bandsV(ctx, w, h, ["#008751", "#ffffff", "#008751"]);
};

export const senegal: FlagPainter = (ctx, w, h) => {
  bandsV(ctx, w, h, ["#00853f", "#fdef42", "#e31b23"]);
  star5(ctx, w / 2, h / 2, Math.min(w, h) * 0.16, "#00853f");
};

export const kenya: FlagPainter = (ctx, w, h) => {
  // black / white-fimbriation / red / white-fimbriation / green
  const u = h / 6;
  rect(ctx, "#000000", 0, 0, w, u);
  rect(ctx, "#ffffff", 0, u, w, u * 0.5);
  rect(ctx, "#bb0000", 0, u * 1.5, w, u * 3);
  rect(ctx, "#ffffff", 0, u * 4.5, w, u * 0.5);
  rect(ctx, "#006600", 0, u * 5, w, u);
  // stylised Maasai shield + crossed spears
  const cx = w / 2;
  const cy = h / 2;
  line(ctx, cx - w * 0.18, cy - h * 0.32, cx + w * 0.18, cy + h * 0.32, "#ffffff", Math.max(1, w * 0.02));
  line(ctx, cx + w * 0.18, cy - h * 0.32, cx - w * 0.18, cy + h * 0.32, "#ffffff", Math.max(1, w * 0.02));
  shield(ctx, cx, cy, w * 0.2, h * 0.42, "#bb0000");
  rect(ctx, "#ffffff", cx - w * 0.02, cy - h * 0.18, w * 0.04, h * 0.36);
};

export const southAfrica: FlagPainter = (ctx, w, h) => {
  // Approximation of the six-colour Y (pall).
  rect(ctx, "#de3831", 0, 0, w, h / 2); // top red
  rect(ctx, "#002395", 0, h / 2, w, h / 2); // bottom blue
  // green pall with white then gold fimbriation, opening to the fly
  ctx.lineJoin = "miter";
  const drawPall = (color: string, lw: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w * 0.33, h / 2);
    ctx.lineTo(w, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.02, h / 2);
    ctx.lineTo(w * 0.33, h / 2);
    ctx.stroke();
  };
  drawPall("#ffffff", h * 0.42);
  drawPall("#007a4d", h * 0.24);
  // black hoist triangle with gold fimbriation
  ctx.fillStyle = "#ffb915";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * 0.42, h / 2);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.06);
  ctx.lineTo(w * 0.33, h / 2);
  ctx.lineTo(0, h * 0.94);
  ctx.closePath();
  ctx.fill();
};

export const egypt: FlagPainter = (ctx, w, h) => {
  bandsH(ctx, w, h, ["#ce1126", "#ffffff", "#000000"]);
  // stylised gold Eagle of Saladin
  const cx = w / 2;
  const cy = h / 2;
  disc(ctx, cx, cy, Math.min(w, h) * 0.13, "#c09300");
  rect(ctx, "#c09300", cx - w * 0.02, cy, w * 0.04, h * 0.16);
};
