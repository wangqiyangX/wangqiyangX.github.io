# 使用三方 API 配置 Xcode 中的 Coding Intelligence

> 本文撰写时，环境为 macOS 26 beta 5，Xcode 26 beta 5

## 设置方法

前往 _Xcode > Setting > Intelligence_

![Config interface](/use-coding-intelligence-with-api-01.png)

### 添加服务

#### 网络模型

![Added remote model provider](/use-coding-intelligence-with-api-02.png)

根据个人所使用的服务提供商的具体信息，填写即可。

需要注意的是，如果服务商提供的密钥为 sk- 开头，则 API Key Header 填写 `x-api-key` 即可。

![remote modle provider form](/use-coding-intelligence-with-api-03.png)

### 本地模型

> 本人没有部署。

![Add local model provider](/use-coding-intelligence-with-api-04.png)

### 设置可用模型和首先模型

Xcode 会自动启用你所勾选的模型中首选 (Favorite) 的模型，并按顺序启用。

![Select favorite model](/use-coding-intelligence-with-api-05.png)

> 其他信息可以查看相关文档：[在 Xcode 中智能编写代码](/docs/xcode/writing-code-with-intelligence-in-xcode)
