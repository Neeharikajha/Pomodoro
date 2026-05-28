// sprites.ts — preloads all character SVGs into HTMLImageElements

import Boy1Url from "../assets/characters/Boy1.svg";
import Boy2Url from "../assets/characters/Boy2.svg";
import Girl1Url from "../assets/characters/Girl1.svg";
import Girl2Url from "../assets/characters/Girl2.svg";
import Cat1Url from "../assets/characters/cat1.svg";
import Cat2Url from "../assets/characters/Cat2.svg";
import Dog1Url from "../assets/characters/Dog1.svg";

export const CHARACTER_KEYS = ["Boy1", "Boy2", "Girl1", "Girl2"] as const;
export type CharacterKey = (typeof CHARACTER_KEYS)[number];

const URL_MAP: Record<string, string> = {
  Boy1: Boy1Url,
  Boy2: Boy2Url,
  Girl1: Girl1Url,
  Girl2: Girl2Url,
  Cat1: Cat1Url,
  Cat2: Cat2Url,
  Dog1: Dog1Url,
};

const cache = new Map<string, HTMLImageElement>();

export function getSprite(key: string): HTMLImageElement | null {
  if (cache.has(key)) return cache.get(key)!;
  const url = URL_MAP[key];
  if (!url) return null;
  const img = new Image();
  img.src = url;
  cache.set(key, img);
  return img;
}

// Preload all sprites up front
export function preloadSprites(): void {
  Object.keys(URL_MAP).forEach(getSprite);
}
