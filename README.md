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

设计规范见 [DESIGN.md](DESIGN.md)，开发路线见 [ROADMAP.md](ROADMAP.md)。

## V6 开发预览

[单文件预览](examples/harbor-approach/v6.html)：从 GitHub 下载原始 HTML 文件后在浏览器打开。联网时尝试加载 Three.js，离线使用内置软件三维渲染。播放按钮会启动声音。

本地开发（Node.js 18+）：

```bash
npm install
npm run dev
npm test
npm run build
npm run standalone
```

V6 先提取相机、运动、几何、专题窗口、音频等职责；暂用 JavaScript ES Modules，不引入额外框架。拖轮专题窗口在 8.25–11.72 秒展开，从整体旋转至水下双推进器，解释推力方向。合成声音仅为过渡方案，尚未引入真实录音或完成试听验收。
