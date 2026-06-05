# 管理员手册

本项目把 Issue 当作候选线索，把 `resources/resources.json` 当作唯一正式数据库。任何用户提交的 Issue 都不会直接写入正式数据。

## 推荐资源处理流程

1. 用户使用“推荐新资源”Issue 模板提交信息。
2. 管理员检查链接、简介、风险说明和提交者关系披露。
3. 对值得继续验证的 Issue 评论：

   ```text
   /approve-resource
   ```

4. GitHub Actions 自动创建一个候选资源草稿 PR。候选项默认：
   - 状态为 `pending`
   - 评分全部为 `3.0`
   - 风险全部为 `unknown`
   - `featured` 为 `false`
5. 管理员在 PR 中完成验证并修改真实数据。
6. 合并 PR 后，资源进入正式数据库；自动任务会更新 README、检测精选资源可用性并提交结果。

只有拥有仓库 `write`、`maintain` 或 `admin` 权限的人可以执行 `/approve-resource`。不要把该权限授予普通提交者。

## 合并候选 PR 前检查

- 主页是 HTTPS 链接，不是单部影视作品链接。
- 名称与简介中立，没有推广话术。
- `category`、`access`、`scores` 和 `risks` 已按实际情况修改。
- 准备设为精选资源时，填写适合表格展示的 `summary_short`。
- `verification.status` 已根据验证结果修改为 `verified`、`recommended` 或 `caution`。
- `verification.notes` 写明验证地区、核心功能和发现的问题。
- 只有确实值得在 README 展示的资源才设置 `"featured": true`。
- 高风险、失效和权利通知按贡献指南记录到 `reports`。

## 自动更新范围

| 事件 | 自动结果 |
| --- | --- |
| 管理员在资源 Issue 评论 `/approve-resource` | 创建候选资源草稿 PR |
| 候选 PR 合并到 `main` | 更新正式数据库 |
| `resources/resources.json` 发生变化 | 根据精选资源重新生成 README，并执行可用性检测 |
| 每天北京时间约 09:00 | 检测精选资源主页状态，更新 README 和 `reports/availability.json` |

README 的精选榜单由 `scripts/sync-readme.mjs` 生成。不要直接修改 `<!-- featured-resources:start -->` 与 `<!-- featured-resources:end -->` 之间的内容，自动任务会覆盖这些修改。

## 建议的仓库设置

- 为 `main` 开启分支保护，普通贡献者必须通过 PR 修改。
- 把 `Validate data` 设置为合并前必须通过的检查。
- 开启 Issue 和 Actions，并允许 GitHub Actions 创建和批准 Pull Request。
- 定期查看 Actions 失败记录、待验证 Issue、草稿 PR 和权利人请求。
- 权利人请求和安全问题必须人工处理，不应自动批准或自动关闭。
