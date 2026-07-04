import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const width = 1600;
const height = 1000;
const bytesPerPixel = 4;
const pixels = Buffer.alloc(width * height * bytesPerPixel);

const colors = {
  night: [7, 26, 21, 255],
  ink: [17, 23, 19, 255],
  forest: [11, 93, 63, 255],
  brass: [215, 168, 62, 255],
  ember: [198, 83, 45, 255],
  hibiscus: [184, 43, 94, 255],
  harmattan: [245, 239, 226, 255],
  sky: [168, 218, 220, 255],
  white: [255, 252, 245, 255],
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

function strokeRect(x, y, w, h, color, weight = 2) {
  fillRect(x, y, w, weight, color);
  fillRect(x, y + h - weight, w, weight, color);
  fillRect(x, y, weight, h, color);
  fillRect(x + w - weight, y, weight, h, color);
}

function fillCircle(cx, cy, r, color) {
  for (let y = -r; y <= r; y += 1) {
    for (let x = -r; x <= r; x += 1) {
      if (x * x + y * y <= r * r) setPixel(cx + x, cy + y, color);
    }
  }
}

function line(x0, y0, x1, y1, color, weight = 4) {
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

const font = {
  " ": ["000", "000", "000", "000", "000", "000", "000"],
  "-": ["000", "000", "000", "111", "000", "000", "000"],
  "0": ["111", "101", "101", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "010", "010", "111"],
  "2": ["111", "001", "001", "111", "100", "100", "111"],
  "3": ["111", "001", "001", "111", "001", "001", "111"],
  "4": ["101", "101", "101", "111", "001", "001", "001"],
  "5": ["111", "100", "100", "111", "001", "001", "111"],
  "6": ["111", "100", "100", "111", "101", "101", "111"],
  "7": ["111", "001", "001", "010", "010", "010", "010"],
  "8": ["111", "101", "101", "111", "101", "101", "111"],
  "9": ["111", "101", "101", "111", "001", "001", "111"],
  "A": ["010", "101", "101", "111", "101", "101", "101"],
  "B": ["110", "101", "101", "110", "101", "101", "110"],
  "C": ["111", "100", "100", "100", "100", "100", "111"],
  "D": ["110", "101", "101", "101", "101", "101", "110"],
  "E": ["111", "100", "100", "110", "100", "100", "111"],
  "F": ["111", "100", "100", "110", "100", "100", "100"],
  "G": ["111", "100", "100", "101", "101", "101", "111"],
  "H": ["101", "101", "101", "111", "101", "101", "101"],
  "I": ["111", "010", "010", "010", "010", "010", "111"],
  "K": ["101", "101", "110", "100", "110", "101", "101"],
  "L": ["100", "100", "100", "100", "100", "100", "111"],
  "M": ["101", "111", "111", "101", "101", "101", "101"],
  "N": ["101", "111", "111", "111", "111", "111", "101"],
  "O": ["111", "101", "101", "101", "101", "101", "111"],
  "P": ["111", "101", "101", "111", "100", "100", "100"],
  "R": ["110", "101", "101", "110", "101", "101", "101"],
  "S": ["111", "100", "100", "111", "001", "001", "111"],
  "T": ["111", "010", "010", "010", "010", "010", "010"],
  "U": ["101", "101", "101", "101", "101", "101", "111"],
  "V": ["101", "101", "101", "101", "101", "101", "010"],
  "Y": ["101", "101", "101", "010", "010", "010", "010"],
};

function drawText(text, x, y, color, scale = 4, tracking = 2) {
  let cursor = x;
  for (const raw of text.toUpperCase()) {
    const glyph = font[raw] || font[" "];
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((value, colIndex) => {
        if (value === "1") {
          fillRect(cursor + colIndex * scale, y + rowIndex * scale, scale, scale, color);
        }
      });
    });
    cursor += 3 * scale + tracking;
  }
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

for (let y = 0; y < height; y += 10) {
  const noise = (y * 37) % 19;
  line(0, y, width, y + noise - 9, [255, 255, 255, 10], 1);
}

const bands = [
  [70, 90, 1460, 58, colors.brass],
  [70, 164, 1180, 26, colors.ember],
  [70, 222, 860, 42, colors.forest],
  [70, 284, 1320, 18, colors.sky],
  [70, 338, 540, 96, colors.hibiscus],
  [650, 338, 740, 36, colors.brass],
  [650, 394, 510, 26, colors.ember],
  [70, 508, 1340, 22, colors.brass],
  [70, 560, 780, 54, colors.forest],
  [910, 560, 500, 54, colors.sky],
  [70, 690, 380, 96, colors.ember],
  [500, 690, 910, 28, colors.brass],
  [500, 748, 640, 42, colors.forest],
  [1188, 748, 222, 42, colors.hibiscus],
];

bands.forEach(([x, y, w, h, color], index) => {
  fillRect(x, y, w, h, color);
  strokeRect(x, y, w, h, [255, 255, 255, index % 2 ? 45 : 25], 2);
});

for (let x = 90; x < 1460; x += 42) {
  fillRect(x, 92, 4, 54, [7, 26, 21, 42]);
}

for (let x = 88; x < 1410; x += 74) {
  fillCircle(x, 519, 6, colors.night);
  fillCircle(x, 519, 3, colors.brass);
}

const route = [
  [170, 825],
  [320, 642],
  [530, 607],
  [750, 475],
  [944, 412],
  [1150, 290],
  [1330, 185],
];
for (let i = 0; i < route.length - 1; i += 1) {
  line(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1], [245, 239, 226, 230], 8);
  line(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1], colors.brass, 3);
}
route.forEach(([x, y], index) => {
  fillCircle(x, y, 22, colors.night);
  fillCircle(x, y, 12, index === 3 ? colors.hibiscus : colors.brass);
});

strokeRect(58, 58, 1484, 884, [245, 239, 226, 160], 3);
strokeRect(94, 606, 230, 260, [245, 239, 226, 90], 2);
strokeRect(1032, 118, 330, 206, [245, 239, 226, 95], 2);
strokeRect(1032, 606, 330, 206, [245, 239, 226, 95], 2);

drawText("ACCRA", 108, 112, colors.night, 12, 8);
drawText("CHRISTMAS", 108, 714, colors.harmattan, 10, 6);
drawText("VILLAGE", 110, 798, colors.harmattan, 10, 7);
drawText("20-26 DEC", 1070, 154, colors.harmattan, 7, 5);
drawText("GATE B", 1070, 232, colors.brass, 6, 4);
drawText("STAGE", 1080, 650, colors.harmattan, 8, 5);
drawText("MARKET", 1080, 730, colors.brass, 6, 4);
drawText("ROUTE", 690, 444, colors.night, 5, 4);

for (let x = 112; x < 1510; x += 28) {
  for (let y = 884; y < 914; y += 10) {
    const palette = [colors.brass, colors.ember, colors.forest, colors.hibiscus, colors.sky];
    fillRect(x, y, 18, 5, palette[(x + y) % palette.length]);
  }
}

const scanline = [255, 255, 255, 8];
for (let y = 0; y < height; y += 3) {
  fillRect(0, y, width, 1, scanline);
}

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

writeFileSync("public/design/woven-signal.png", png);
console.log("Wrote public/design/woven-signal.png");
