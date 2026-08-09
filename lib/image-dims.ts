import "server-only";
import fs from "node:fs";
import path from "node:path";

// Intrinsic pixel size of an image in /public, read from its header at build
// time. next/image needs true width and height: they set the aspect ratio the
// layout reserves, so a guessed pair letterboxes the image inside a box of the
// wrong shape and hands the lightbox a lie about what it is displaying.
//
// A header read rather than a dependency — three formats cover everything the
// site ships, and getting it wrong fails the build rather than a request.

const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Build-scoped: the same plate appears in an entry, its index card and its OG
 *  image, and generateStaticParams renders every entry in one process. */
const cache = new Map<string, Dims>();

export type Dims = { w: number; h: number };

function png(b: Buffer): Dims | null {
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
  // IHDR is always the first chunk: length(4) + "IHDR"(4), then w and h.
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function jpeg(b: Buffer): Dims | null {
  if (b.length < 4 || b.readUInt16BE(0) !== 0xffd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    // SOF0-SOF15 carry the frame size; C4/C8/CC are tables and codes, not frames.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

function webp(b: Buffer): Dims | null {
  if (b.length < 30 || b.toString("ascii", 0, 4) !== "RIFF") return null;
  if (b.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = b.toString("ascii", 12, 16);
  // Three container flavours, three places the size hides. The 14-bit fields
  // are masked because the top bits are scaling hints, not size.
  if (chunk === "VP8 ") {
    return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    const u24 = (o: number) => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16);
    return { w: u24(24) + 1, h: u24(27) + 1 };
  }
  return null;
}

/**
 * `src` is a public-root path as written in MDX or frontmatter ("/projects/x.png").
 * Throws rather than guessing — a plate with the wrong shape is a silent visual
 * bug, and every caller here runs at build time where a throw is a failed build.
 */
export function imageDims(src: string): Dims {
  const hit = cache.get(src);
  if (hit) return hit;

  if (!src.startsWith("/")) {
    throw new Error(`imageDims: "${src}" must be a path under /public, starting with "/"`);
  }
  const file = path.join(PUBLIC_DIR, src);
  if (!fs.existsSync(file)) {
    throw new Error(`imageDims: no such image "${src}" (looked in public${src})`);
  }

  const buf = fs.readFileSync(file);
  const dims = png(buf) ?? webp(buf) ?? jpeg(buf);
  if (!dims || !dims.w || !dims.h) {
    throw new Error(`imageDims: could not read the size of "${src}" — PNG, JPEG and WebP only`);
  }

  cache.set(src, dims);
  return dims;
}
