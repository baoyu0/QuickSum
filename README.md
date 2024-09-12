# AI聊天助手浏览器扩展

这是一个强大的浏览器扩展，让用户能够方便地与多种先进的AI模型进行聊天交互。无论是日常使用还是开发调试，这个扩展都能为您提供便捷的AI对话体验。

## 主要特性

- 多模型支持：集成了OpenAI、Anthropic、Azure OpenAI和Google PaLM等主流AI模型
- 灵活配置：可自定义每个模型的API设置，满足不同用户的需求
- 主题切换：支持亮色、暗色和跟随系统设置，保护您的眼睛
- API连接测试：内置测试功能，确保API设置正确无误
- 安全可靠：本地存储API密钥，保护您的隐私安全
- 用户友好：简洁直观的界面设计，易于使用

## 安装指南

1. 克隆此仓库到本地：
   ```bash
   git clone https://github.com/your-username/ai-chat-assistant.git
   ```
2. 打开Chrome浏览器，进入扩展管理页面（chrome://extensions/）
3. 在右上角启用"开发者模式"
4. 点击"加载已解压的扩展程序"，选择克隆下来的仓库目录

## 使用方法

1. 安装完成后，点击浏览器工具栏中的扩展图标
2. 在弹出的选项页面中，选择您想使用的AI模型
3. 输入相应的API密钥和其他必要设置
4. 点击"测试API连接"按钮，确保连接正常
5. 点击"保存"按钮保存您的设置
6. 现在您可以开始与AI进行对话了！

## 详细配置说明

### OpenAI
- API密钥：您的OpenAI API密钥
- 模型选择：支持GPT-3.5和GPT-4等多种模型

### Anthropic
- API密钥：您的Anthropic API密钥

### Azure OpenAI
- API密钥：您的Azure OpenAI API密钥
- 终端地址：Azure OpenAI服务的终端地址
- 部署名称：您在Azure上部署的模型名称

### Google PaLM
- API密钥：您的Google PaLM API密钥

### 主题设置
- 亮色：默认亮色主题
- 暗色：护眼暗色主题
- 跟随系统：自动跟随系统主题设置

## 常见问题

1. Q: 如何获取各个AI服务的API密钥？
   A: 请访问各服务提供商的官方网站，注册账号并申请API密钥。

2. Q: 为什么我的API连接测试失败？
   A: 请检查您的API密钥是否正确，以及网络连接是否正常。如果问题持续，请查看浏览器控制台是否有更详细的错误信息。

3. Q: 扩展支持哪些浏览器？
   A: 目前主要支持Chrome浏览器，其他基于Chromium的浏览器（如Edge、Brave等）也可能兼容。

## 贡献指南

我们欢迎并感谢任何形式的贡献！如果您想为这个项目做出贡献，请遵循以下步骤：

1. Fork 这个仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 将您的更改推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 联系我们

如果您有任何问题或建议，欢迎通过以下方式联系我们：

- 提交 GitHub Issue
- 发送邮件至：[your-email@example.com](mailto:your-email@example.com)

感谢您使用我们的AI聊天助手浏览器扩展！