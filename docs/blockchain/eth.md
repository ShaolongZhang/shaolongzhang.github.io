---
order: 2
toc: menu
title: 以太坊合约
---

<!-- 其他 Markdown 内容 -->

本篇主要是说明怎么搭建开发以太坊的合约不涉及以太坊合约 Solidaty 语言的介绍

## 网络环境

- Ethereum Mainnet 主网
- Ethereum Testnet Ropsten 测试网
- Ethereum Testnet Rinkeby 测试网
- Ethereum Testnet Görli 测试网
- Ethereum Testnet Kovan 测试网

## 开发环境

- 在线 remix 开发 https://remix.ethereum.org/
- 用 vscode 等 ide 开发
- 本地部署 remix 开发

1. 本地部署 remix 可以 docker 部署，也可以自己下载 remix 安装包，本地启动

```bash
docker pull remixproject/remix-ide:latest  ##获取最新的镜像
docker run -p 8080:80 remixproject/remix-ide:latest ##启动镜像服务
##本地的端口就可以网页访问remix浏览器
```

2. 本地安装 remixd 并启动

```bash
npm install remixd -g
remixd -s [path/ur/solidity/files] --remix-ide http://localhost:8080
##本地的端口就可以网页访问remix浏览器
```

搭建完本地的 remix，我们就可以直接访问本地的 remix 进行开发编程，解决线上代码编辑保存的问题。

## 开发框架

### truffle 框架

- Node js 环境安装 需要`8.0`以上的版本
  1. 通过官网直接下载 Node 的.pkg 包
  2. 中文官网 download
  3. truffle npm 是 0.6 版本的，其他版本可能会报错
- `truffle-config.js` 的网络信息

```bash
module.exports = {
  networks: {
     development: {
         //网络信息
         host: "127.0.0.1",
         port: 8545,
         network_id: "*" // 匹配任何网络
    }
  }
};
```

- truffle unbox xxxx 可以在下不同的 DApp 的模版
- Openzeppelin 集成了 ERC20 ERC721 的实现，可以简化开发流程

```bash
##truffle 和  openzeppelin 开发合约
truffle init
npm init -y
npm install @openzeppelin/contracts    ##添加openzeppenlin的包
```

- truffle web 智能合约
  大概熟悉了 truffle 是做什么用的，我们来完整的创建 web 应用的以太坊智能合约

```bash
##truffle 和  openzeppelin 开发合约
truffle init webpack
##编译合约
truffle compile
##执行测试用例
truffle test ./test/TestMetacoin.sol
##部署
truffle develop
##Truffle Develop started at http://127.0.0.1:9545/
```

web 应用的以太坊智能合约大概的目录结构

```bash
    app/： ##前端的js css
    contracts/: ##Solidity合约目录
    migrations/: ##部署脚本文件目录
    test/: ##测试脚本目录，
    node_modules/： ##依赖包
    webpack.config.js ##配置文件
    truffle.js: ##Truffle 配置文件
```

### Hardhat 框架

`Hardhat` 和`node`的版本要对应上，我们来构建一个简单的 hardhat 的合约工程目录

```bash
##创建工程目录
mkdir hardhat-test
cd hardhat-test
npm init --yes
npm install --save-dev hardhat
##运行npx hardhat
npx hardhat
##初始化账户
npx hardhat accounts
##编译合约
npx hardhat compile
##执行合约
npx hardhat run scripts/sample-script.js
##运行本地服务
npx hardhat node
##Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
##链接到本地网络
npx hardhat run scripts/sample-script.js --network localhost
```

- `hardhat`框架目录的基本信息

```bash
contracts/  ##合约信息
scripts/  ##自动化脚本目录
test/     ##测试目录
hardhat.config.js
```

- `hardhat.config.js`里面的主要内容

```bash
module.exports = {
  solidity: "0.7.1"
}

##可以扩展solidity的其他属性信息
module.exports = {
  solidity: {
    version: "0.7.1",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  }
}

##添加的网络其他配置信息
module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts',
 },
  networks: {
    hardhat: {
      chainId: 1337
    }
  }
};
```

- `Hardhat` 对`typescript`的支持

```bash
npm install --save-dev ts-node typescript
##基本的依赖信息
npm install --save-dev chai @types/node @types/mocha @types/chai
```
