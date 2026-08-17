# 县域医共体药品动态管理 · 演示系统

首都医科大学模拟政协提案小组（演示作品）。

纯静态多页面演示网站：首页 → 多角色登录 → 按角色进入专属工作台，覆盖药品目录动态管理、处方流转与权限协同、慢病用药便民服务三大核心功能。

## 本地预览

直接双击 `index.html` 即可在浏览器打开（无需服务器）。

## 部署到公网（免费、免备案）

> 备案号、政府网站标识码等虚构信息已删除，站点仅为演示作品，可安全部署。

### 方式一：GitHub Pages（推荐，永久免费）

1. 注册 / 登录 GitHub（https://github.com）。
2. 安装 GitHub 命令行工具并登录授权：

```bash
winget install --id GitHub.cli   # 若 winget 不可用，去 https://cli.github.com 下载安装
gh auth login                    # 选 GitHub.com → HTTPS → Login with a web browser
```

3. 在本目录（`网站/`）执行，一键创建仓库并上传：

```bash
cd "F:\2026年\模拟政协\要交的材料\网站"
gh repo create ygt-drug-platform --public --source . --push
```

4. 打开仓库 **Settings → Pages**：
   - Source 选 **Deploy from a branch**
   - Branch 选 **main**，目录选 **/ (root)**
   - 点 **Save**

5. 约 1 分钟后访问：

```
https://<你的用户名>.github.io/ygt-drug-platform/
```

### 方式二：Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

完成后得到一个 `https://<项目名>.vercel.app` 链接。

## 公网链接（请填入作品说明）

```
示例：https://<你的用户名>.github.io/ygt-drug-platform/
```

## 角色账号（演示）

登录页选择角色后，账号密码任意填写（或留空）即可进入：

| 角色 | 可访问功能 |
| --- | --- |
| 参保群众 | 我的慢病档案 · 取药进度 · 政策资讯（看不到目录管理/处方流转） |
| 村医 | 缺药上报 · 慢病建档与续方 · 处方调配 |
| 县级医生 | 电子开方 · 续方审核 · 授权管理 |
| 县药剂科 | 缺药审核 · 目录管理 · 数据看板 |

## 目录结构

```
网站/
├── index.html            首页（公开门户）
├── login.html            统一登录
├── dashboard.html        角色工作台（登录后）
├── drug-manage.html      药品目录动态管理
├── prescription.html     处方流转与权限协同
├── chronic-service.html  慢病用药便民服务
├── guide.html            全角色操作指南
├── effect.html           政策成效
└── common.css / common.js / drugs-data.js
```
