# 资源数据

`resources.json` 是项目的资源主数据，也是未来 zhuiju.me 生成页面时的主要数据源。

## 分类

| 值 | 分类 |
| --- | --- |
| `online_video` | 在线影视 |
| `cloud_search` | 网盘资源搜索 |
| `magnet_search` | 磁力& BT |
| `subtitles` | 字幕站、字幕组与字幕工具 |
| `player` | TVbox播放器与客户端 |
| `subscription` | IPTV、广播与其他订阅源 |
| `membership` | 会员拼团与省钱信息 |
| `other` | 其他追剧相关资源 |

## 关键字段

- `id`：稳定、唯一的资源标识，收录后不要随意修改。
- `featured`：是否进入 README 精选榜单。
- `featured_order`：可选。手动控制精选榜单排序，数字越小越靠前；未填写时按推荐星级降序、添加时间降序自动排序。
- `summary_short`：精选榜单使用的短简介；精选资源必须填写，建议控制在 20 个中文字符左右。
- `scores`：能力评分，不包含风险总分。
- `risks`：版权、安全、隐私和支付风险。
- `verification`：资源当前状态和最后一次验证摘要。
- `source`：首次收录来源与日期。

完整限制见 [`schema.json`](schema.json)。每次修改资源后，应同步追加 [`reports/verifications.json`](../reports/verifications.json) 中的验证记录。
