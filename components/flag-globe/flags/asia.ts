import type { FlagPainter } from "../types";
import { bandsH, rect, disc, crescent, star5, chakra } from "./helpers";

export const turkiye: FlagPainter = (ctx, w, h) => {
  rect(ctx, "#e30a17", 0, 0, w, h);
  const cx = w * 0.42;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.22;
  crescent(ctx, cx, cy, r, "#ffffff", "#e30a17");
  star5(ctx, cx + r * 1.15, cy, r * 0.5, "#ffffff", -Math.PI / 2 + 0.35);
};

export const india: FlagPainter = (ctx, w, h) => {
  bandsH(ctx, w, h, ["#ff9933", "#ffffff", "#138808"]);
  chakra(ctx, w / 2, h / 2, Math.min(w, h) * 0.16, "#000080");
};

export const china: FlagPainter = (ctx, w, h) => {
  rect(ctx, "#de2910", 0, 0, w, h);
  const big = Math.min(w, h) * 0.16;
  star5(ctx, w * 0.17, h * 0.25, big, "#ffde00");
  const small = big * 0.34;
  const around: [number, number][] = [
    [0.33, 0.12],
    [0.4, 0.22],
    [0.4, 0.35],
    [0.33, 0.45],
  ];
  for (const [fx, fy] of around) {
    star5(ctx, w * fx, h * fy, small, "#ffde00", -Math.PI / 2 + 0.4);
  }
};

export const japan: FlagPainter = (ctx, w, h) => {
  rect(ctx, "#ffffff", 0, 0, w, h);
  disc(ctx, w / 2, h / 2, Math.min(w, h) * 0.3, "#bc002d");
};
