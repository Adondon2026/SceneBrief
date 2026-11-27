# SceneBrief 声音资产库

这是实际可调用的声音资源入口，不是单纯的设计记录。任何配轨先执行 [AGENTS.md](../AGENTS.md) 的复用约束，再依 [DESIGN.md D05–D06](../DESIGN.md) 配置事件表。

- [catalog.json](catalog.json)：8种已筛选程序合成音色、14种采样候选的稳定ID与可用状态。声音家族是初始用途索引，不是已经验收的组合。
- [原始 Gemini 合成试听台](procedural/original-lab.html)：用户提供的完整自包含 HTML，原有23种候选全部保留以便复查。只有 catalog 中的8个 ID 是已筛选结果；其他音色不得视为已认可。
- [selected.mjs](procedural/selected.mjs)：基于原始 DSP 类封装的8种音色调用和离线渲染接口。默认工业重量100%、音调−12半音、混响0.216（原试听台显示27%）、音量0.85；离线渲染保留尾音，使用固定种子，音色公式沿用原代码。原始试听台自身的默认混响仍为0.22；使用时按筛选报告调整。

## 调用

浏览器通过 HTTP 本地服务或同源模块加载：
```js
import {createEngine,playSelected,renderSelected} from "./procedural/selected.mjs";
const engine=createEngine();
playSelected(engine,"G01"); // 用户操作触发，原有 DSP 音色
const buffer=await renderSelected("G08"); // 可交给离线混音/导出，48 kHz 双声道
```

直接双击 original-lab.html 可独立试听；ES module 跨文件加载建议通过本地 HTTP 服务，避免 file:// 的模块加载限制。渲染方法返回 AudioBuffer，不直接生成整片音轨；使用 cue sheet 对齐绝对时间轴。没有实际听感验收不得声称新封装或组合已验收。

## 采样资产边界

A04、A09、A11、A12、A18、A21、A29、B03–B09 的具体原始时间见 [OnSite V4 记录](../docs/AUDIO-BASELINE-ONSITE-V4.md)。第三方采样及混合音轨的再分发许可未核实，不公开存放。私有资产包约定路径 samples/{ID}.wav，原始文件、筛选台与参考轨单独归档；目前私有仓库尚未连接/建立，catalog 明确标记不可从 main 直接取得。不得假装可访问。取得授权及私有资产后按原 ID 调用，B组逐条复核硬裁切、叠加及必要合并；渐入渐隐不代表质量通过。

固定组合尚未通过实际试听，不能编造为成熟预设。使用 [音频设计](../templates/AUDIO-DESIGN.md) 和 [事件表](../templates/AUDIO-CUE-SHEET.md) 记录并验证后再归档组合。许可记录见 [LICENSES.md](LICENSES.md)。
