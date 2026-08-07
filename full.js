import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ---------- 命令行参数 ----------
const targetDir = process.argv[2];
const args = process.argv.slice(3);
const isDryRun = args.includes('--dry-run');
const isBackup = args.includes('--backup');

if (!targetDir) {
  console.error('用法: node convert-md-digits.js <目录路径> [--dry-run] [--backup]');
  console.error('   --dry-run   只预览不实际修改文件');
  console.error('   --backup    修改前生成 .bak 备份文件');
  process.exit(1);
}

// ---------- 核心替换函数 ----------
// 全角数字范围：０(FF10) ~ ９(FF19) 对应半角 0(30) ~ 9(39)
// 差值固定为 0xFEE0 (65248)
function replaceFullwidthDigits(text) {
  return text.replace(/[\uFF10-\uFF19]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
  });
}

// ---------- 递归遍历目录 ----------
async function walkDir(dir) {
  let files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await walkDir(fullPath));
    } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.md') {
      files.push(fullPath);
    }
  }
  return files;
}

// ---------- 主逻辑 ----------
async function main() {
  try {
    const stats = await fs.stat(targetDir);
    if (!stats.isDirectory()) {
      console.error('路径不是一个目录');
      process.exit(1);
    }
  } catch {
    console.error('目录不存在或无法访问');
    process.exit(1);
  }

  console.log(`扫描目录: ${targetDir}`);
  const mdFiles = await walkDir(targetDir);
  console.log(`找到 ${mdFiles.length} 个 Markdown 文件\n`);

  let totalModified = 0;

  for (const filePath of mdFiles) {
    const content = await fs.readFile(filePath, 'utf8');
    const newContent = replaceFullwidthDigits(content);

    if (content === newContent) continue; // 没有全角数字

    totalModified++;
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`将修改: ${relativePath}`);

    // 预览模式（试运行）
    if (isDryRun) continue;

    // 备份
    if (isBackup) {
      const backupPath = filePath + '.bak';
      await fs.writeFile(backupPath, content);
      console.log(`已备份至: ${path.basename(backupPath)}`);
    }

    // 写入新内容
    await fs.writeFile(filePath, newContent, 'utf8');
  }

  if (isDryRun) {
    console.log(`\n试运行完成（未实际改动）。共 ${totalModified} 个文件需要修改。`);
  } else {
    console.log(`\n完成！共修改 ${totalModified} 个文件。`);
  }
}

main().catch((err) => {
  console.error('发生错误:', err);
  process.exit(1);
});