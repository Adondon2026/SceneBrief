# SceneBrief

基于场景的可视化简报 / Scene-based visual briefings.

面向工程技术叙事的电影化三维信息展示项目。参考老版《现代战争》三部曲的动态情报简报设计，但不使用原作资产。

首个案例：大型集装箱船在双拖轮辅助下进港靠泊。

## 设计目标

- 高信息密度，低注意力分散度。
- 运镜、景别与多层级信息共同讲述具体事件。
- 工程内容真实、可解释；不靠空泛技术名词填充画面。
- 通用能力从成熟案例中逐步提炼，避免过早搭建复杂框架。

## 开发状态

项目处于原型阶段。[V5 单文件原型](examples/harbor-approach/legacy/v5.html) 已保留为回归基线（下载后用浏览器打开），后续迁移为模块化 Three.js 项目。当前运动为预设动画，非经验证的水动力仿真。

设计规范见 [DESIGN.md](DESIGN.md)（以 main 最新版为准），开工与验收要求见 [AGENTS.md](AGENTS.md)，设计经验及用户确认基线见 [设计迭代记录](docs/DESIGN-HISTORY.md)，开发路线见 [ROADMAP.md](ROADMAP.md)，强制制作流程见 [WORKFLOW.md](WORKFLOW.md)，质量关卡见 [QUALITY.md](QUALITY.md)。

核心视觉原则：**主体突出展示，细节饱和堆积。** 学术 V11 画面与 V12 音画为当前用户确认的参考基线；本次仅归档规范与经验，未将对话交付的成片入库。


新案例通过 Motion Lab 用户验收后，直接继承该源码，以约20秒为一批累计扩展；每批实际渲染、修正、旧段视觉回归及内部验收。Swift 当前认可基线见 [18秒 Motion Lab 02](examples/swift-racing/motion-lab-02.html)，进度见 [审查记录](examples/swift-racing/review.md)。新作不内置旁白字幕，仅提供独立 SRT。
