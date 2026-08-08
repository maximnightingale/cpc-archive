const fs = require('fs');
const path = require('path');

// 递归获取所有 .md 文件
function walkDir(dir) {
    let results = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            if (item !== 'node_modules' && item !== '.git' && item !== '.vitepress') {
                results = results.concat(walkDir(full));
            }
        } else if (item.endsWith('.md')) {
            results.push(full);
        }
    }
    return results;
}

// 解析 frontmatter
function parseFrontmatter(content) {
    const lines = content.split('\n');
    if (lines[0].trim() !== '---') return null;
    
    let endIdx = -1;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
            endIdx = i;
            break;
        }
    }
    if (endIdx === -1) return null;

    const frontLines = lines.slice(1, endIdx);
    const data = {};
    let currentKey = null;
    let currentVal = [];

    for (const line of frontLines) {
        const trimmed = line.trim();
        if (trimmed === '') continue;

        if (/^[ \t]/.test(line)) {
            if (currentKey) {
                currentVal.push(trimmed);
            }
            continue;
        }

        const match = trimmed.match(/^([^:]+):\s*(.*)$/);
        if (match) {
            if (currentKey) {
                data[currentKey] = currentVal.length > 0 ? currentVal.join('\n') : '';
            }
            currentKey = match[1].trim();
            const val = match[2].trim();
            if (val) {
                currentVal = [val];
            } else {
                currentVal = [];
            }
        }
    }
    if (currentKey) {
        data[currentKey] = currentVal.length > 0 ? currentVal.join('\n') : '';
    }

    return data;
}

// 提取所有 frontmatter 并输出到文本文件
function extractAll(dir, outputFile) {
    const files = walkDir(dir);
    const result = [];
    let total = 0;
    let withFm = 0;

    for (const file of files) {
        total++;
        const content = fs.readFileSync(file, 'utf-8');
        try {
            const data = parseFrontmatter(content);
            if (data && Object.keys(data).length > 0) {
                withFm++;
                result.push({
                    file: file,
                    frontmatter: data
                });
            }
        } catch (e) {
            console.error(`⚠️ 解析失败: ${file}`);
        }
    }

    // 生成输出内容
    let output = `=== Frontmatter 提取结果 ===\n`;
    output += `扫描目录: ${dir}\n`;
    output += `总文件数: ${total}\n`;
    output += `含有 frontmatter 的文件数: ${withFm}\n`;
    output += `生成时间: ${new Date().toLocaleString()}\n\n`;
    output += `='.repeat(60)}\n\n`;

    for (const item of result) {
        output += `【文件】${item.file}\n`;
        output += `【Frontmatter】\n`;
        for (const [key, value] of Object.entries(item.frontmatter)) {
            output += `  ${key}: ${value}\n`;
        }
        output += `\n${'='.repeat(60)}\n\n`;
    }

    fs.writeFileSync(outputFile, output, 'utf-8');
    console.log(`✅ 已输出到: ${outputFile}`);
    console.log(`📊 共处理 ${total} 个文件，其中 ${withFm} 个含有 frontmatter`);
}

// 使用方式：node extract-frontmatter.js [目录路径] [输出文件]
const targetDir = process.argv[2] || '.';
const outputFile = process.argv[3] || 'frontmatter_output.txt';
extractAll(targetDir, outputFile);