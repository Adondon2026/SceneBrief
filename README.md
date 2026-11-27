# SceneBrief

基于场景的可视化简报 / Scene-based visual briefings。面向工程技术叙事的电影化三维信息展示，参考老版《现代战争》三部曲的动态情报简报语言，不复制原作资产。

**高信息密度，低注意力分散度；主体突出展示，细节饱和堆积；主体与细节共同活起来。声音语义统一，丰富而有序。** 工程内容真实、可解释，通用能力由成熟案例提炼。

## 规范导航（统一版 1.0）

| 你需要了解什么 | 权威文件 |
| --- | --- |
| Agent 如何开工 | [AGENTS.md](AGENTS.md) |
| 什么样的作品才好 | [DESIGN.md](DESIGN.md) |
| 如何设计全片与镜头 | [DIRECTING.md](DIRECTING.md) |
| 如何制作、审批、冻结与发布 | [WORKFLOW.md](WORKFLOW.md) |
| 如何验收、回归及处理失败 | [QUALITY.md](QUALITY.md) |
| 如何填写实际设计及审查产物 | [导演脚本](templates/DIRECTOR-SCRIPT.md)、[镜头设计](templates/SHOT-DESIGN.md)、[声音设计](templates/AUDIO-DESIGN.md)、[声音事件表](templates/AUDIO-CUE-SHEET.md)、[审查记录](templates/REVIEW.md) |
| 规则如何形成、旧章节映射 | [设计历史](docs/DESIGN-HISTORY.md) |
| 技术实现与未来计划 | [ROADMAP.md](ROADMAP.md) |

建议阅读 DESIGN → DIRECTING → WORKFLOW → QUALITY；Agent 先读 AGENTS。每个规则由责任文件维护，其他文件引用。

## 声音资源

[声音资产库](audio/README.md) · [音色索引](audio/catalog.json) · [原始程序合成试听台](audio/procedural/original-lab.html)。新任务必须优先复用用户筛选音色，第三方采样需要私有资产包，未确认组合不得冒充成熟预设。

## 制作主线

证据研究 → 全局导演设计 → 资产规划 → 完整导演脚本（用户审批）→ 实际基准帧/核心动态实验 → Motion Lab（用户认可）→ 每批约20秒累计制作并回归 → 后期与终审 → 归档与复盘。声音与旁白从设计阶段规划；默认独立 SRT 与音轨，HTML 不内置旁白字幕。

## 案例与开发状态

当前仍为案例驱动的原型阶段，而不是已完成的通用渲染框架。

- [港口 V5 原型](examples/harbor-approach/legacy/v5.html)：保留回归样本，运动为预设示意而非经验证的水动力仿真。
- [Swift Motion Lab 02](examples/swift-racing/motion-lab-02.html)：用户认可18秒代表片段；累计视觉版 [38秒](examples/swift-racing/batch-02.html)、[58秒](examples/swift-racing/batch-03.html)、[78秒](examples/swift-racing/batch-04.html) 及 [审查记录](examples/swift-racing/review.md)。最终完整观看与声音制作尚未完成（以案例最新记录为准）。
- 学术 V11/V12 为历史视觉/声音参考，原成片未入 main；OnSite V4 仅归档 [配轨经验与候选](docs/AUDIO-BASELINE-ONSITE-V4.md)，未公开 WAV。

本仓库公开；案例资料、成片、音频等默认私有交付，明确授权且核对敏感性和许可后才入库，详见 WORKFLOW。规范整理不修改已冻结作品。
