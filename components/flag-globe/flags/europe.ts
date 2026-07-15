import type { FlagPainter } from "../types";
import { bandsH, bandsV, rect, line } from "./helpers";

export const france: FlagPainter = (ctx, w, h) => {
  bandsV(ctx, w, h, ["#0055a4", "#ffffff", "#ef4135"]);
};

export const germany: FlagPainter = (ctx, w, h) => {
  bandsH(ctx, w, h, ["#000000", "#dd0000", "#ffce00"]);
};

export const italy: FlagPainter = (ctx, w, h) => {
  bandsV(ctx, w, h, ["#009246", "#ffffff", "#ce2b37"]);
};

export const spain: FlagPainter = (ctx, w, h) => {
  rect(ctx, "#aa151b", 0, 0, w, h * 0.25);
  rect(ctx, "#f1bf00", 0, h * 0.25, w, h * 0.5);
  rect(ctx, "#aa151b", 0, h * 0.75, w, h * 0.25);
  // stylised coat of arms toward the hoist
  rect(ctx, "#aa151b", w * 0.34, h * 0.36, w * 0.06, h * 0.28);
  rect(ctx, "#c8b100", w * 0.4, h * 0.36, w * 0.05, h * 0.28);
};

export const unitedKingdom: FlagPainter = (ctx, w, h) => {
  // Union Jack (proportioned approximation).
  rect(ctx, "#012169", 0, 0, w, h);
  // white diagonals
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = h * 0.3;
  line(ctx, 0, 0, w, h, "#ffffff", h * 0.3);
  line(ctx, w, 0, 0, h, "#ffffff", h * 0.3);
  // red diagonals (counterchanged — drawn thinner, offset for the St Patrick look)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  line(ctx, 0, 0, w, h, "#c8102e", h * 0.12);
  line(ctx, w, 0, 0, h, "#c8102e", h * 0.12);
  ctx.restore();
  // white cross
  rect(ctx, "#ffffff", 0, h * 0.35, w, h * 0.3);
  rect(ctx, "#ffffff", w * 0.42, 0, w * 0.16, h);
  // red cross (St George)
  rect(ctx, "#c8102e", 0, h * 0.42, w, h * 0.16);
  rect(ctx, "#c8102e", w * 0.455, 0, w * 0.09, h);
};
