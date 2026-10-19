import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

// Extract only the existing artwork. Alpha-component cleanup preserves the white shirt and dark hair.
const input = "public/assets/tom/illustrated/expression-sheet.png";
const output = "public/assets/tom/sprites";
await fs.mkdir(output, { recursive: true });
const { width, height } = await sharp(input).metadata();
const poses = [
  ["idle", 0, 0, 178, 153],
  ["greeting", 1, 0, 195, 151],
  ["happy", 3, 0, 190, 151],
  ["excited", 3, 2, 188, 160],
  ["proud", 0, 1, 173, 159],
  ["angry", 2, 1, 170, 159],
  ["shocked", 0, 2, 176, 160],
  ["crying", 3, 1, 188, 159],
];
const manifest = [];
for (const [name, col, row, headX, eyeY] of poses) {
  const left = Math.round((col * width) / 4),
    top = Math.round((row * height) / 3);
  const w = Math.round(((col + 1) * width) / 4) - left,
    h = Math.round(((row + 1) * height) / 3) - top;
  const { data, info } = await sharp(input)
    .extract({ left, top, width: w, height: h })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const visited = new Uint8Array(w * h);
  let removed = 0;
  const components = [];
  for (let p = 0; p < w * h; p++) {
    if (visited[p] || data[p * 4 + 3] < 16) continue;
    const component = [],
      queue = [p];
    visited[p] = 1;
    let nearWhite = 0;
    for (let q = 0; q < queue.length; q++) {
      const n = queue[q],
        x = n % w,
        y = Math.floor(n / w);
      component.push(n);
      if (data[n * 4] > 240 && data[n * 4 + 1] > 240 && data[n * 4 + 2] > 240)
        nearWhite++;
      for (const [nx, ny] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]) {
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const next = ny * w + nx;
        if (!visited[next] && data[next * 4 + 3] >= 16) {
          visited[next] = 1;
          queue.push(next);
        }
      }
    }
    components.push({
      pixels: component,
      nearWhite,
      touchesEdge: component.some(
        (n) =>
          n % w === 0 ||
          n % w === w - 1 ||
          Math.floor(n / w) === 0 ||
          Math.floor(n / w) === h - 1,
      ),
    });
  }
  const largest = Math.max(...components.map((c) => c.pixels.length));
  for (const c of components) {
    if (
      c.pixels.length !== largest &&
      (c.touchesEdge ||
        c.pixels.length < 85 ||
        (c.pixels.length < 2000 && c.nearWhite / c.pixels.length > 0.9))
    ) {
      for (const n of c.pixels) data[n * 4 + 3] = 0;
      removed += c.pixels.length;
    }
  }
  // Remove residual near-transparent specks without touching the antialiased character edge.
  for (let p = 0; p < w * h; p++) if (data[p * 4 + 3] < 16) data[p * 4 + 3] = 0;
  const scale = 1.2,
    rw = Math.round(w * scale),
    rh = Math.round(h * scale);
  const x = Math.round(256 - headX * scale),
    y = Math.round(215 - eyeY * scale);
  const sprite = await sharp(data, {
    raw: { width: w, height: h, channels: info.channels },
  })
    .resize(rw, rh, { kernel: "lanczos3" })
    .png()
    .toBuffer();
  if (x < 0 || y < 0 || x + rw > 512 || y + rh > 560)
    throw new Error(`Unsafe crop for ${name}`);
  const filename = `${name}.webp`;
  await sharp({
    create: {
      width: 512,
      height: 560,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: sprite, left: x, top: y }])
    .webp({ lossless: true, effort: 6 })
    .toFile(path.join(output, filename));
  manifest.push({
    name,
    file: filename,
    sourceCell: [col, row],
    sourceRect: { left, top, width: w, height: h },
    canvas: [512, 560],
    headAnchor: [256, 215],
    scale,
    removedDetachedPixels: removed,
  });
}
await fs.writeFile(
  path.join(output, "manifest.json"),
  JSON.stringify(
    { source: input, sourceSize: [width, height], sprites: manifest },
    null,
    2,
  ) + "\n",
);
// QA-only contact sheet; the runtime loads the individual transparent assets.
const panels = await Promise.all(
  poses.map(async ([name]) => ({
    input: await sharp(path.join(output, `${name}.webp`))
      .resize(256, 280)
      .png()
      .toBuffer(),
  })),
);
await sharp({
  create: { width: 1024, height: 560, channels: 4, background: "#f4ece5" },
})
  .composite(
    panels.map((panel, i) => ({
      ...panel,
      left: (i % 4) * 256,
      top: Math.floor(i / 4) * 280,
    })),
  )
  .png()
  .toFile(path.join(output, "contact-sheet.png"));
console.log(
  `Extracted ${poses.length} sprites from ${width}×${height}; source unchanged.`,
);
