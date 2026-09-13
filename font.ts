import { fontSplit } from 'cn-font-split';
import fs from 'node:fs';
import path from 'node:path';

async function main(): Promise<void> {
  const inputPath = 'public/fonts/汇文仿宋.woff2';
  const outputDir = 'public/fonts/汇文仿宋';

  console.log('正在切割: 汇文仿宋...');

  const inputBuffer = new Uint8Array(
    fs.readFileSync(path.resolve(inputPath)).buffer
  );

  await fontSplit({
    input: inputBuffer,
    outDir: outputDir,
    cssFileName: '汇文仿宋.css',
    fontDisplay: 'swap',
  });

  console.log('切割完成，输出至:', outputDir);
}

main().catch(console.error);