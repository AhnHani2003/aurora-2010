"use client";
import Image from "next/image";
import { useState } from "react";
import { TOM_SPRITES, type SpriteName } from "./sprites";
/** All poses share a 512×560 canvas and head anchor. Never stretch or reframe on a pose change. */
export function TomSprites({ sprite }: { sprite: SpriteName }) {
  const [loaded, setLoaded] = useState<Partial<Record<SpriteName, boolean>>>(
    {},
  );
  const [lastReady, setLastReady] = useState<SpriteName>("idle");
  const visible = loaded[sprite] ? sprite : lastReady;
  // Retain the decoded pose while a slower network finishes the next one.
  if (loaded[sprite] && lastReady !== sprite) setLastReady(sprite);
  return (
    <div
      className="tom-sprite-stack"
      data-sprite={visible}
      data-requested-sprite={sprite}
    >
      {(Object.keys(TOM_SPRITES) as SpriteName[]).map((name) => (
        <Image
          key={name}
          className={`tom-sprite ${visible === name ? "is-active" : ""}`}
          src={TOM_SPRITES[name].src}
          alt={
            visible === name
              ? `Tom, your illustrated boyfriend — ${TOM_SPRITES[name].label}`
              : ""
          }
          aria-hidden={visible !== name}
          width={512}
          height={560}
          unoptimized
          loading="eager"
          sizes="(max-width: 900px) 130px, 340px"
          onLoad={() =>
            setLoaded((previous) =>
              previous[name] ? previous : { ...previous, [name]: true },
            )
          }
          draggable={false}
        />
      ))}
    </div>
  );
}
