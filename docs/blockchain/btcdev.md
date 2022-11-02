---
order: 5
toc: menu
title: 简单搭建比特币节点
---

<!-- 其他 Markdown 内容 -->

## 环境准备

弄一个阿里云的机器，我们的系统安装的 centos 系统，系统磁盘就普通的盘，不过要是实际安装节点的话，还是建议安装 ssd 的盘，带宽要高点，主要是节点数据的同步

## 开始搭建

```bash
sudo wget https://bitcoin.org/bin/bitcoin-core-0.10.0/bitcoin-core-0.10.0-linux.tar.gz

sudo tar -xzf bitcoin-core-0.10.0-linux.tar.gz

sudo cp bitcoin-core-0.10.0-linux/bin/64/bitcoind /usr/bin
```

## 开始配置

**配置文件修改,默认路径~/.bitcoin/bitcoin.conf**

```bash
testnet=1
server=1
daemon=1
rpcuser=node
rpcpassword=node
rpcport=8332
port=8333
walletnotify=xxxxx
blocknotify=xxxx
```

备注：rpcconnect = 配置成本机的地址 ip 就可以监听本地 0:0:0:0 ，我们主要关注`rpcuser` 和`rpcpassword`的配置，以及 rpcport 需要修改下。默认`127.0.0.1:18332`就可以启动，安全期间我们需要把端口修改，`walletnotify`和`blocknotify`这两个是在实际中交易配置中才使用，要是只是搭建节点可以不用配置

## 一些基本命令

- bitcoind
- bitcoin-cli stop
- bitcoin-cli help
