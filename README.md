# claw-hub

graph TD
%% 定义节点样式（可选，为了美观）
classDef layer fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
classDef subLayer fill:#f3e5f5,stroke:#4a148c,stroke-width:1px,stroke-dasharray: 5 5;

    %% 节点定义
    WebUI["Web UI 交互层<br/><small>← 前端聊天界面</small>"]:::layer
    Gateway["Gateway 网关层<br/><small>← 调度中心，处理消息路由、会话管理</small>"]:::layer
    Agent["Agent 引擎层<br/><small>← 核心推理循环，ReAct思考-执行闭环</small>"]:::layer
    Skills["Skills 技能层<br/><small>← 可扩展的工具能力，文件/搜索/命令执行</small>"]:::subLayer
    Memory["Memory 记忆层<br/><small>← 本地会话持久化，保存对话历史</small>"]:::subLayer

    %% 连接关系
    WebUI -->|WebSocket通信| Gateway
    Gateway --> Agent
    Agent -.- Skills
    Agent -.- Memory

    %% 样式归类
    class WebUI,Gateway,Agent layer;
    class Skills,Memory subLayer;
