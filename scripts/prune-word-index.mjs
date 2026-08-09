/* Prune the sentiment tokenizer's word_index.json down to the entries the
   Lab actually uses. The tokenizer maps any index ≥ VOCAB_SIZE (10,000) to
   the OOV token, so dropping those rows is lossless — and takes the payload
   from ~2.1MB to ~200KB. Run from the repo root after (re)exporting the
   model; the pruned file is committed.

     node scripts/prune-word-index.mjs
*/
import { readFileSync, writeFileSync } from "node:fs";

const VOCAB_SIZE = 10000;
const SRC = "public/models/sentiment/v1/word_index.json";
const OUT = "public/models/sentiment/v1/word_index.min.json";

const src = JSON.parse(readFileSync(SRC, "utf8"));
const out = {};
let kept = 0;
for (const [word, idx] of Object.entries(src)) {
  if (typeof idx === "number" && idx > 0 && idx < VOCAB_SIZE) {
    out[word] = idx;
    kept++;
  }
}
writeFileSync(OUT, JSON.stringify(out));
console.log(`kept ${kept} of ${Object.keys(src).length} entries → ${OUT}`);
