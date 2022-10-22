---
order: 4
toc: menu
title: solidaty语言基础
---

## 数据类型

### 布尔型

```solidity
// 布尔值
bool public bool = true;
```

### 整型

```js
int public int_a = -1; // 整数，包括负数
uint public uint_a = 1; // 正整数
uint256 public number = 20220330; // 256位正整数
```

### 地址类型

> **地址类型(address)存储一个 20 字节的值（以太坊地址的大小**

```js
address public _address = 0xxxxxxxxxxxxxxx;
// 地址类型的成员
uint256 public balance = _address.balance; // balance of address
```

### 定长字节数组

> **字节数组 bytes 分两种，一种定长（byte, bytes8, bytes32），另一种不定长。定长的属于数值类型，不定长的是引用类型**

```js
bytes32 public _byte32 = "test";
bytes1 public _byte = _byte32[0];
```

### 枚举 enum

```js
enum Test {
    ETH,
    BTC,
    HT
}
// 创建enum变量 test
Test test = Test.ETH;
```
