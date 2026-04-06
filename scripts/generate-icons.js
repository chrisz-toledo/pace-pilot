/**
 * Generates solid-color PNG icons for PACE-Pilot PWA without external dependencies.
 * McDonald's Gold: #FFBC0D (R=255, G=188, B=13)
 */
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function crc32(buf) {
  const table = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c;
  });
  let crc = 0xffffffff;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function createPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // RGB color type
  // bytes 10-12 = 0 (compression, filter, interlace)

  // Raw scanlines: filter byte (0) + RGB pixels per row
  const raw = Buffer.alloc((1 + size * 3) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const off = y * (size * 3 + 1) + 1 + x * 3;
      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// McDonald's Gold
const R = 255, G = 188, B = 13;
const publicDir = path.join(__dirname, "../public");
fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, "icon-192.png"), createPNG(192, R, G, B));
fs.writeFileSync(path.join(publicDir, "icon-512.png"), createPNG(512, R, G, B));
fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), createPNG(180, R, G, B));

console.log("✓ PWA icons generated (192, 512, 180px — McDonald's Gold)");
