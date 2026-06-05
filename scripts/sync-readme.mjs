import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const resourcesPath = new URL("resources/resources.json", root);
const availabilityPath = new URL("reports/availability.json", root);
const readmePath = new URL("README.md", root);
const startMarker = "<!-- featured-resources:start -->";
const endMarker = "<!-- featured-resources:end -->";
const countStartMarker = "<!-- resource-count:start -->";
const countEndMarker = "<!-- resource-count:end -->";
const timeZone = "Asia/Shanghai";

const categories = [
  { id: "online_video", name: "在线影视", badge: "在线影视", color: "2563eb" },
  { id: "cloud_search", name: "网盘资源搜索", badge: "网盘搜索", color: "64748b" },
  { id: "magnet_search", name: "磁力与 BT 搜索", badge: "磁力与_BT", color: "7c3aed" },
  { id: "subtitles", name: "字幕资源", badge: "字幕资源", color: "d97706" },
  { id: "player", name: "TVbox播放器", badge: "TVbox播放器", color: "059669" },
  { id: "subscription", name: "订阅源", badge: "订阅源", color: "db2777" },
  { id: "membership", name: "会员拼团", badge: "会员拼团", color: "64748b" }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function anchorFor(name) {
  return name.toLowerCase().replaceAll(" ", "-");
}

function statusDisplay(status) {
  return {
    reachable: "🟢 可&#8288;访问",
    restricted: "🟡 访问&#8288;受限",
    unreachable: "🔴 无法&#8288;访问",
    unknown: "⚪ 未&#8288;检测"
  }[status] ?? "⚪ 未&#8288;检测";
}

function dateInTimeZone(timestamp) {
  if (!timestamp || Number.isNaN(Date.parse(timestamp))) {
    return "未检测";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .formatToParts(new Date(timestamp))
    .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});

  return `${parts.year}&#8209;${parts.month}&#8209;${parts.day}`;
}

function shortSummary(resource) {
  return String(resource.summary_short ?? resource.summary).replace(/[。.!！]$/, "");
}

function tableFor(resources, availabilityById) {
  const rows = resources
    .map((resource) => {
      const availability = availabilityById.get(resource.id);
      const status = statusDisplay(availability?.status ?? "unknown");
      const checkedAt = dateInTimeZone(availability?.checked_at);

      return `    <tr>
      <td><a href="${escapeHtml(resource.url)}">${escapeHtml(resource.name)}</a></td>
      <td>${escapeHtml(shortSummary(resource))}</td>
      <td align="center">${resource.scores.more.toFixed(1)}</td>
      <td align="center">${resource.scores.speed.toFixed(1)}</td>
      <td align="center">${resource.scores.clean.toFixed(1)}</td>
      <td align="center">${resource.scores.stable.toFixed(1)}</td>
      <td align="center"><!-- availability:${resource.id} -->${status}<!-- /availability:${resource.id} --></td>
      <td align="center"><!-- availability-date:${resource.id} -->${checkedAt}<!-- /availability-date:${resource.id} --></td>
    </tr>`;
    })
    .join("\n");

  return `<table width="100%">
  <thead>
    <tr>
      <th width="18%">资源</th>
      <th width="27%">简介</th>
      <th width="5%">多</th>
      <th width="5%">快</th>
      <th width="5%">净</th>
      <th width="5%">稳</th>
      <th width="8%">状&#8288;态</th>
      <th width="15%">检&#8288;测</th>
    </tr>
  </thead>
  <tbody>
${rows}
  </tbody>
</table>`;
}

function categorySection(category, resources, availabilityById) {
  const categoryResources = resources.filter((resource) => resource.category === category.id);
  let content;

  if (categoryResources.length > 0) {
    content = tableFor(categoryResources, availabilityById);
  } else if (category.id === "membership") {
    content =
      "_等待首条通过验证的精选资源。仅收录规则透明、风险明确的会员拼团信息。_";
  } else {
    content =
      "_等待首条通过验证的精选资源。你可以 [推荐一个资源](https://github.com/laoma2053/awesome-zhuiju-free/issues/new?template=resource.yml)。_";
  }

  return `### ${category.name}

${content}

<p align="right"><a href="#精选资源">返回分类导航</a></p>`;
}

const resourcesData = JSON.parse(await readFile(resourcesPath, "utf8"));
const availabilityData = JSON.parse(await readFile(availabilityPath, "utf8"));
const featuredResources = resourcesData.resources.filter((resource) => resource.featured);
const availabilityById = new Map(
  availabilityData.results.map((result) => [result.resource_id, result])
);

const badges = categories
  .map((category) => {
    const count = featuredResources.filter((resource) => resource.category === category.id).length;
    return `  <a href="#${anchorFor(category.name)}"><img src="https://img.shields.io/badge/${category.badge}-${count}-${category.color}?style=flat-square" alt="${category.name}"></a>`;
  })
  .join("\n");

const generated = `${startMarker}
<p align="center">
${badges}
</p>

> 精选内容来自 [\`resources/resources.json\`](resources/resources.json)。状态由 GitHub Actions 每日自动检测：\`🟢 可访问\`、\`🟡 访问受限\`、\`🔴 无法访问\`、\`⚪ 未检测\`。检测结果仅代表 GitHub Actions 节点当时的网络情况。

自动状态只判断主页是否响应，不替代人工的推荐、风险与体验评价。完整检测结果见 [\`reports/availability.json\`](reports/availability.json)。

检测任务每天北京时间 09:00 左右运行；新增或修改资源后也会自动运行。你也可以在 [Check availability](https://github.com/laoma2053/awesome-zhuiju-free/actions/workflows/check-availability.yml) 页面手动触发。

${categories
  .map((category) => categorySection(category, featuredResources, availabilityById))
  .join("\n\n")}
${endMarker}`;

const readme = await readFile(readmePath, "utf8");
const startIndex = readme.indexOf(startMarker);
const endIndex = readme.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
  throw new Error(
    `README must contain ${startMarker} and ${endMarker} around the generated featured section.`
  );
}

let updatedReadme =
  readme.slice(0, startIndex) + generated + readme.slice(endIndex + endMarker.length);

const countStartIndex = updatedReadme.indexOf(countStartMarker);
const countEndIndex = updatedReadme.indexOf(countEndMarker);
if (countStartIndex === -1 || countEndIndex === -1 || countEndIndex < countStartIndex) {
  throw new Error(
    `README must contain ${countStartMarker} and ${countEndMarker} around the resource count badge.`
  );
}

const countBadge = `${countStartMarker}[![Resources](https://img.shields.io/badge/已收录-${resourcesData.resources.length}_个资源-0f766e?style=for-the-badge)](resources/resources.json)${countEndMarker}`;
updatedReadme =
  updatedReadme.slice(0, countStartIndex) +
  countBadge +
  updatedReadme.slice(countEndIndex + countEndMarker.length);

if (updatedReadme !== readme) {
  await writeFile(readmePath, updatedReadme, "utf8");
  console.log(`README featured section synced from ${featuredResources.length} resources.`);
} else {
  console.log("README featured section is already up to date.");
}
