#!/usr/bin/env node
/**
 * 从 cpc.people.com.cn 抓取文章并格式化为项目 md 格式
 *
 * 用法：
 *   node fetch.cjs <url> [output-dir] [filename]
 *
 * 示例：
 *   node fetch.cjs "http://cpc.people.com.cn/GB/64162/64168/64566/65385/4441842.html"
 *   node fetch.cjs "http://cpc.people.com.cn/GB/64162/64168/64566/65385/4441842.html" ./13/3
 *   node fetch.cjs "http://cpc.people.com.cn/GB/64162/64168/64566/65385/4441842.html" ./13/3 "中共中央关于加强和改进企业思想政治工作的通知.md"
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { TextDecoder } from "node:util";

const decoder = new TextDecoder("gbk", { fatal: false });

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let data = Buffer.alloc(0);
        res.on("data", (chunk) => {
          data = Buffer.concat([data, chunk]);
        });
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function decodeHtml(buffer) {
  return decoder.decode(buffer);
}

function extractTitle(str) {
  const m = str.match(/class="bt1">([^<]+)<\/td>/i);
  return m ? m[1].trim() : "Unknown";
}

function extractDate(str) {
  // Match （中文日期内容）
  const m = str.match(
    /<td[^>]*height="35"[^>]*align="center"[^>]*>\s*（([^）]+)）\s*<\/td>/i
  );
  if (m) {
    return `*（${m[1].trim()}）*`;
  }
  // Fallback: look for any （...） on a date-like line
  const m2 = str.match(/height="35"[^>]*>\s*（([^）]+)）/i);
  if (m2) {
    return `*（${m2[1].trim()}）*`;
  }
  return "";
}

function extractBody(str) {
  const m = str.match(/<FONT class=fbody id=zoom>([\s\S]*?)<\/FONT>/i);
  if (!m) return "";
  let body = m[1];
  // Convert <br> to newline
  body = body.replace(/<br\s*\/?>/gi, "\n");
  // Strip remaining HTML tags
  body = body.replace(/<[^>]+>/g, "");
  // Remove source line
  body = body.replace(/来源：[^<]*/g, "");
  // Collapse 3+ newlines to 2
  body = body.replace(/\n{3,}/g, "\n\n");
  body = body.trim();
  return body;
}

/**
 * 将提取的纯文本正文转为 md 格式：
 * - 段落首行保留 &emsp;&emsp; 缩进（中文排版惯例）
 * - 识别「一、」「二、」等一级标题 → ##
 * - 识别「（一）」「（二）」等二级编号段落 → ###
 * - 处理断行：把连续换行且无缩进的空行合并
 */
function toMarkdown(body) {
  const lines = body.split("\n");
  const mdLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines (we'll add them back selectively)
    if (trimmed === "") {
      // Keep a single blank line
      const prev = mdLines[mdLines.length - 1];
      if (prev !== "") mdLines.push("");
      continue;
    }

    // Detect level-1 heading: "一、" "二、" etc. (possibly with leading spaces)
    if (/^[　\s]*[一二三四五六七八九十]+、/.test(trimmed)) {
      // Remove leading whitespace
      const clean = trimmed.replace(/^[　\s]+/, "");
      // Handle line-wrapped headings (e.g. "二、建立在...\n体制")
      // Skip empty lines and check if next non-empty line is a continuation
      let heading = clean;
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j].trim();
        if (nextLine === "") { j++; continue; } // skip empty lines
        // If next non-empty line looks like a continuation (short, no heading pattern)
        if (
          !/^[　\s]*[一二三四五六七八九十]+、/.test(nextLine) &&
          nextLine.length < 60 &&
          !/^[（(][一二三四五六七八九十]+[)）]/.test(nextLine)
        ) {
          heading += nextLine;
          // Mark this line as consumed so the main loop skips it
          lines[j] = "";
          j++;
        } else {
          break;
        }
      }
      mdLines.push(`## ${heading}`);
      mdLines.push("");
      continue;
    }

    // Detect level-2 heading: "（一）" "（二）" etc. at start of line (no indent)
    if (/^[（(][一二三四五六七八九十]+[)）]/.test(trimmed)) {
      const clean = trimmed.replace(/^[　\s]+/, "");
      mdLines.push(`### ${clean}`);
      mdLines.push("");
      continue;
    }

    // Regular paragraph: add &emsp;&emsp; indent
    const indent = "　　";
    mdLines.push(indent + trimmed);
  }

  // Collapse multiple blank lines
  let result = mdLines.join("\n");
  result = result.replace(/\n{3,}/g, "\n\n");
  return result.trim() + "\n";
}

function buildFrontmatter(title, dateMd) {
  // prev/next are left empty — should be filled in manually or derived from index.md
  const fm = `---
prev: 
  text: 
  link: 
next: 
  text: 
  link: 
---

# ${title}
${dateMd}

[[toc]]
---
`;
  return fm;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log("用法: node fetch.cjs <url> [output-dir] [filename]");
    process.exit(1);
  }

  const url = args[0];
  const outputDir = args[1] || ".";
  const filename = args[2] || null;

  console.log(`正在抓取: ${url}`);

  let htmlBuffer;
  try {
    htmlBuffer = await fetchHtml(url);
  } catch (e) {
    console.error("抓取失败:", e.message);
    process.exit(1);
  }

  const html = decodeHtml(htmlBuffer);
  const title = extractTitle(html);
  const dateMd = extractDate(html);
  let body = extractBody(html);

  console.log(`标题: ${title}`);
  console.log(`日期: ${dateMd}`);
  console.log(`正文长度: ${body.length} 字符`);

  // Convert to markdown
  const mdBody = toMarkdown(body);

  // Build frontmatter
  const frontmatter = buildFrontmatter(title, dateMd);

  // Full markdown content
  const mdContent = frontmatter + "\n" + mdBody;

  // Determine output path
  const outPath = filename
    ? path.join(outputDir, filename)
    : path.join(outputDir, `${title}.md`);

  // Create directory if needed
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  fs.writeFileSync(outPath, mdContent, "utf8");
  console.log(`已保存: ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
