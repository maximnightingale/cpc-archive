import { fontSplit } from 'cn-font-split';
import fs from 'node:fs';
import path from 'node:path';

async function main(): Promise<void> {
  const inputPath = path.resolve('public/fonts/汇文仿宋.woff2');
  const outputDir = path.resolve('public/fonts/汇文仿宋');

  console.log('输入:', inputPath);
  console.log('输出:', outputDir);

  if (!fs.existsSync(inputPath)) {
    console.error('找不到原始字体文件');
    process.exit(1);
  }

  const inputBuffer = new Uint8Array(fs.readFileSync(inputPath).buffer);

  await fontSplit({
    input: inputBuffer,
    outDir: outputDir,
    fontDisplay: 'swap',
  });

  const files = fs.readdirSync(outputDir);
  console.log('生成的文件:', files.join(', '));
}

main().catch(console.error);