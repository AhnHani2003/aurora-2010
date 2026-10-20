"use client";
import { useLocalizedTree } from "@/components/i18n/LanguageProvider";
import Image from "next/image";
import { useState } from "react";
import { photos } from "@/data/photos";
import { Flower } from "./Botanicals";
export function PhotoCard({
  photo,
  onClick,
}: {
  photo: (typeof photos)[number];
  onClick?: () => void;
}) {
  const localize = useLocalizedTree();
  const [missing, setMissing] = useState(false);
  return localize(
    <button
      type="button"
      className={`polaroid photo-${photo.index}`}
      onClick={onClick}
      aria-label={`View ${photo.caption}`}
    >
      <div className={`photo-image palette-${photo.index % 4}`}>
        {!missing ? (
          <Image
            src={photo.src}
            alt={photo.caption}
            fill
            sizes="(max-width: 600px) 140px, 190px"
            onError={() => setMissing(true)}
          />
        ) : (
          <div className="photo-placeholder">
            <span className="photo-star">✧</span>
            <Flower
              color={
                ["#e0a0ae", "#b6aacb", "#e5ba80", "#d5a4b7"][photo.index % 4]
              }
            />
            <small>
              A little memory
              <br />
              belongs here
            </small>
          </div>
        )}
      </div>
      <span className="photo-caption">{photo.caption}</span>
      <span className="photo-tape" />
    </button>,
  );
}
