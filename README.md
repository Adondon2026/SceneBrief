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

## V7：从锚地到靠泊的作业简报

[下载单文件预览 V7](examples/harbor-approach/v7.html)（90 秒）。在 GitHub 文件页下载原始 HTML 后，用浏览器打开；无需启动服务器。

V7 新增地球定位、锚泊状态、进港服务需求、四艘拖轮资源分配及会合路线。后半段保留连续三维运镜，增加推靠合力/力矩和艏艉岸距专题解析。调度四艘拖轮是本案的虚构设定：T01、T02 推靠，T03、T04 伴航和外侧待命；不是任何实际港口的强制配置。全部参数和港区均为演示数据，禁止用于实际航行与调度决策。

全局地理轮廓来自 [Natural Earth 公共领域数据](https://www.naturalearthdata.com/about/terms-of-use/) 的简化陆地掩膜，不是卫星影像或航海图。配拖考虑因素参考 [新加坡海事及港务管理局 Towage](https://www.mpa.gov.sg/port-marine-ops/marine-services/pilotage-and-towage/towage)。

## V8 Motion Lab / 连续动态构图实验

[打开单文件预览的 GitHub 文件页](examples/harbor-approach/motion-lab-v8.html)，下载原始 HTML 后浏览器打开。18.5 秒，独立于 V7 的 90 秒完整版。开发模式运行 `npm run dev` 后访问 `/motion-lab.html`；导出运行 `npm run motion-lab`。旁白依赖设备上已安装的本地中文语音，未检测到时保留字幕，音效独立开关。

## V9：完整连续动态简报

[完整 90 秒 HTML 预览](examples/harbor-approach/v9.html)（下载原始文件后直接打开）；[旁白时间轨 SRT](examples/harbor-approach/v9-narration.srt)。V9 完整版不调用浏览器或微软 TTS，仅保留字幕与原有事件音效。后续可按 SRT 制作外部语音素材。运行 `npm run standalone` 可重建 HTML 和 SRT。V7 与 V8 实验文件继续保留为对照。

## Research Series 01

[波浪中的控制能力](examples/wave-control/README.md)：基于近期学术讨论的独立90秒研究简报，保留港口案例不变。
