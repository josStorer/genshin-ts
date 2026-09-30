# CLI 命令

- `gsts build`
- `gsts dev`
- `gsts inject`
- `gsts maps`
- `gsts open map` / `gsts open backup`

## 检查生成的节点图

`gsts analyze dist/example.json` 为单个 IR 文档或文档数组输出 JSON 报告。
命令只读取指定文件，不编译或注入地图。报告包含各类节点、执行线和数据线数量，
以及适合检查的循环、分支、局部变量操作、定时器、列表拼装、集合局部变量写入
（可能涉及快照）和共用数据输出节点 ID。
统计描述的是输入 IR，不代表运行耗时，也不保证等于最终 GIA 的节点数量。
