# Research Series 01 — 波浪中的控制能力

## 定位

以 2026-11-26 的研究讨论为依据，展示“环境变化下的船舶控制能力”这一研究对象。具体案例选取波浪中的单桨单舵欠驱动船舶航向修正；不是宣称该任务已经是最终论文选题，也不预设 AI、系统辨识或某个控制算法为核心创新。

## 影片结构

| 时间 | 核心内容 |
| --- | --- |
| 0–12 s | 航向修正任务、桨舵约束与波浪影响 |
| 12–23 s | SHOPERA 与 2018 国际基准研究；提出面向控制的后续问题 |
| 23–35 s | 波浪、运动状态、桨舵载荷的耦合 |
| 35–47 s | 物理机理、约束模/自由航行数据与面向控制建模 |
| 47–60 s | 有限时域任务能力与边界 |
| 60–72 s | 能力约束下精细控制与闭环反馈 |
| 72–85 s | 数值、约束模、自由航行、闭环验证及尺度外推 |
| 85–90 s | 回到统一研究问题：能否实现、余度多大、边界在哪 |

## 参考资料

- European Commission CORDIS, SHOPERA (2013–2016): https://cordis.europa.eu/project/id/605221/reporting
- Shigunov et al. (2018), International benchmark study on numerical simulation methods for prediction of manoeuvrability of ships in waves, Ocean Engineering: https://www.sciencedirect.com/science/article/pii/S0029801818313039
- SINTEF, Establishment of a Validation and Benchmark Database for the Assessment of Ship Operation in Adverse Conditions: https://www.sintef.no/en/publications/publication/0198cc515c86-26c4e791-5621-4f11-abcc-6e80dc9bb114/

现有研究成果与待研究问题应区分。影片不复刻论文图表，不伪造文献数据、控制性能或试验结果。波浪、船姿、概念能力域、试验水池、模型力项及控制链是示意，不是经验证的动力学模型。原型使用共享船体几何与 Canvas 投影，未实际进行 WebGL、视觉及帧率验收。无音效、无 TTS；另附旁白 SRT。

## 播放与维护

下载 [research-v1.html](research-v1.html) 原始文件后在浏览器打开；[research-v1.srt](research-v1.srt) 为独立旁白轨。开发模式运行 npm run dev 后打开 /research.html。源码位于 src/cases/wave-control/research-film.js。181 个模拟绘制时间点与播放器暂停、拖动、重播检查通过。

## V2 Motion Lab 02

[26 秒文献—图表—物理场景实验](research-motion-lab-v2.html)；[开工审查、分镜及验证记录](MOTION-LAB-02.md)。完整90秒 V1 暂不修改。
