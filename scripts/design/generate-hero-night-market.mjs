import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const width = 1600;
const height = 1000;
const bytesPerPixel = 4;
const pixels = Buffer.alloc(width * height * bytesPerPixel);

const colors = {
  night: [7, 26, 21, 255],
  deep: [3, 14, 12, 255],
  palm: [11, 93, 63, 255],
  gold: [215, 168, 62, 255],
  clay: [198, 83, 45, 255],
  hibiscus: [184, 43, 94, 255],
  sky: [168, 218, 220, 255],
  paper: [245, 239, 226, 255],
};

function blend(base, overlay) {
  const alpha = overlay[3] / 255;
  return [
    Math.round(overlay[0] * alpha + base[0] * (1 - alpha)),
    Math.round(overlay[1] * alpha + base[1] * (1 - alpha)),
    Math.round(overlay[2] * alpha + base[2] * (1 - alpha)),
    255,
  ];
}

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const index = (Math.floor(y) * width + Math.floor(x)) * bytesPerPixel;
  const existing = [pixels[index], pixels[index + 1], pixels[index + 2], 255];
  const next = color[3] === 255 ? color : blend(existing, color);
  pixels[index] = next[0];
  pixels[index + 1] = next[1];
  pixels[index + 2] = next[2];
  pixels[index + 3] = 255;
}

function fillRect(x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      setPixel(xx, yy, color);
    }
  }
}

function line(x0, y0, x1, y1, color, weight = 3) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const steps = Math.max(dx, dy);
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t);
    fillCircle(x, y, weight, color);
  }
}

function fillCircle(cx, cy, r, color) {
  for (let y = -r; y <= r; y += 1) {
    for (let x = -r; x <= r; x += 1) {
      if (x * x + y * y <= r * r) setPixel(cx + x, cy + y, color);
    }
  }
}

function strokeRect(x, y, w, h, color, weight = 2) {
  fillRect(x, y, w, weight, color);
  fillRect(x, y + h - weight, w, weight, color);
  fillRect(x, y, weight, h, color);
  fillRect(x + w - weight, y, weight, h, color);
}

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

fillRect(0, 0, width, height, colors.night);

for (let y = 0; y < height; y += 1) {
  const fade = y / height;
  const shade = Math.round(34 * fade);
  line(0, y, width, y, [0, shade, Math.round(shade * 0.7), 24], 1);
}

for (let x = 0; x < width; x += 82) {
  line(x, 0, x + 220, height, [245, 239, 226, 12], 1);
}

line(0, 780, width, 690, [215, 168, 62, 170], 7);
line(0, 812, width, 722, [198, 83, 45, 110], 4);
line(0, 852, width, 760, [168, 218, 220, 96], 3);

const stalls = [
  [730, 520, 230, 210, colors.gold],
  [990, 500, 250, 230, colors.palm],
  [1270, 535, 220, 195, colors.clay],
];

stalls.forEach(([x, y, w, h, color], index) => {
  fillRect(x, y, w, h, [3, 14, 12, 210]);
  fillRect(x, y, w, 18, color);
  strokeRect(x, y, w, h, [245, 239, 226, 38], 2);
  fillRect(x + 22, y + 54, w - 44, 18, [245, 239, 226, 34]);
  fillRect(x + 22, y + 92, Math.max(80, w - 96), 14, [245, 239, 226, 24]);
  fillCircle(x + w - 38, y + 38, 10, index === 1 ? colors.sky : colors.gold);
});

for (let x = 680; x < 1510; x += 92) {
  line(x - 45, 390, x + 45, 390, [245, 239, 226, 70], 1);
  fillCircle(x, 405 + ((x / 92) % 2) * 18, 13, [215, 168, 62, 230]);
  fillCircle(x, 405 + ((x / 92) % 2) * 18, 28, [215, 168, 62, 36]);
}

const silhouettes = [
  [550, 690, 28],
  [610, 716, 22],
  [670, 704, 24],
  [1440, 724, 26],
  [1504, 705, 20],
];

silhouettes.forEach(([x, y, r]) => {
  fillCircle(x, y - r - 12, r, colors.deep);
  fillRect(x - r * 0.7, y - 16, r * 1.4, 96, colors.deep);
});

for (let x = 70; x < 1510; x += 36) {
  const palette = [colors.gold, colors.clay, colors.palm, colors.hibiscus, colors.sky];
  fillRect(x, 908, 20, 5, palette[x % palette.length]);
  fillRect(x, 930, 14, 4, [245, 239, 226, 48]);
}

strokeRect(52, 58, 1496, 884, [245, 239, 226, 70], 2);
fillRect(0, 0, 620, height, [7, 26, 21, 80]);

const raw = Buffer.alloc((width * bytesPerPixel + 1) * height);
for (let y = 0; y < height; y += 1) {
  const rowStart = y * (width * bytesPerPixel + 1);
  raw[rowStart] = 0;
  pixels.copy(raw, rowStart + 1, y * width * bytesPerPixel, (y + 1) * width * bytesPerPixel);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

writeFileSync("public/design/hero-night-market.png", png);
console.log("Wrote public/design/hero-night-market.png");
