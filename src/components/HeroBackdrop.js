"use client";

import { useEffect, useState } from "react";

const CUTS = [
  "61yUif3pS3Q",
  "csmvtPunIO4",
  "mNTM4yduwqc",
  "r2WxfaH54i4",
  "b72-YzLumZg",
];

function pickCut() {
  return CUTS[Math.floor(Math.random() * CUTS.length)];
}

function embedSrc(id) {
  const query = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    playsinline: "1",
    loop: "1",
    playlist: id,
    modestbranding: "1",
    rel: "0",
    showinfo: "0",
    iv_load_policy: "3",
    disablekb: "1",
    fs: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${query}`;
}

export function HeroBackdrop() {
  const [id, setId] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;
    const frame = requestAnimationFrame(() => setId(pickCut()));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="hero-back" aria-hidden="true">
      <img className="hero-poster" src="/demo/cut-01.jpg" alt="" />
      {id ? (
        <iframe
          className={ready ? "hero-yt is-on" : "hero-yt"}
          src={embedSrc(id)}
          title="Стрижка"
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          onLoad={() => setReady(true)}
        />
      ) : null}
      <span className="hero-shade" />
    </div>
  );
}
