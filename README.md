### 前端项目

1. 选择 `antd-mobile` 作为UI框架
2. 使用webpack
3. 使用babel-loader打包js文件,实现按需打包,减少项目体积
4. 项目源文件在src目录下

### 设置打包路径(可忽略)
```
在项目根目录,新建一个buildPath.js
编辑写入"module.exports = '输出目录的绝对路径 或 相对路径'"

路径例子: "D:/work/go/src/spread/releasetask/public/assets"

```

### 安装初始化
```
npm install
```

### 启动&调试
```
npm run start
```

### 编译
```
npm run build
```
### 目录结构
```
.
├── README.md
├── build // 编译后生成的目录(没有buildPath.js的默认输出目录)
│   └── dist // 编译后生成的目录
|       ├── static //js与css的目录
|       ├── index.html //页面html文件
|       ├── favicon.ico //页面图标
|       └── manifest.json //安装相关页面配置
├── public // 非js与css的资源
├── package.json
├── tsconfig.json // ts的编译设置
├── tslint.json // tslint代码格式规范检测设置
├── config // 打包设置
|   ├── webpack.config.prod.js //编译打包设置, npm run build
│   └── webpack.config.dev.js // 调试打包设置, npm run start
├── scripts // 可运行的脚本
└── src // 源代码
```
