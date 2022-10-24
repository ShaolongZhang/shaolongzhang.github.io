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

## 函数

一个基本的合约函数形式

```js
function <function name>(<parameter types>) {internal|external|public|private} [pure|view|payable] [returns (<return types>)]
```

- `function`：声明函数时的固定用法，想写函数，就要以 function 关键字开头。
- `function name`：函数名。
- (`parameter types`)：函数的变量类型和名字。
- {`internal|external|public|private`}：函数可见性说明符，一共 4 种。没标明函数类型的，默认 internal。

  1. `public`: 内部外部均可见。任何一方 (或其它合约)都可以调用你合约里的函数
  2. `private`: 只能从本合约内部访问，这意味着即使是继承自合约的子合约都不能访问它
  3. `external`: 只能从合约外部访问（但是可以用 this.f()来调用，f 是函数名）
  4. `internal`: 只能从合约内部访问，继承的合约可以用（也可用于修饰状态变量）。

- [`pure|view|payable`]：决定函数权限/功能的关键字。payable（可支付的），带着它的函数，运行的时候可以给合约转入 ETH。在 Solidity v4.17 之前，只有 constant,后续版本拆分成 view 和 pure

  1. `pured`修饰的函数不能改也不能读状态变量
  2. `view`代表可见的，**可读取状态变量但是不能改动变量**

- [returns ()]：函数返回的变量类型和名称。

  1. `returns`加在函数名后面，用于声明返回的变量类型及变量名；
  2. `return` 用于函数主体中，返回指定的变量。

## 数据存储

`storage`，`memory`和`calldata`。不同存储位置的 gas 成本不同。`storage`类型的数据存在链上，类似计算机的硬盘，消耗 gas 多；`memory`和`calldata`类型的临时存在内存里，消耗 gas 少

1. `storage`：合约里的状态变量默认都是`storage`，存储在链上。
2. `memory`：函数里的参数和临时变量一般用`memory`，存储在内存中，不上链。
3. `calldata`：和 memory 类似，存储在内存中，不上链。与 memory 的不同点在于 calldata 变量不能修改（immutable）

## 数据结构

### 结构体

```js
//和c++ go 语言的结构体类似
struct Model {
   unit x;
   unit y;
   bool test;
   address haha
}
Model model //初始化
```

### 数组

```js
 //固定长度的数字
 uint[16] array1;
 bytes1[16] array2;
 address[32] array3;
```

```js
 //可变长度数组
 uint[] array1;
 bytes1[] array2;
 address[] array3;
```

```js
 //memory动态数组,memory修饰的动态数组，可以用new操作符来创建，但是必须声明长度，并且声明后长度不能改变
uint[] memory array1 = new uint[](5);
bytes memory array2 = new bytes(9);
```

### 映射 Mapping

声明映射的格式为 mapping(\_KeyType => \_ValueType)，其中\_KeyType 和\_ValueType 分别是 Key 和 Value 的变量类型

```js
//映射的_KeyType只能选择solidity默认的类型，比如uint，address等，不能用自定义的结构体。而_ValueType可以使用自定义的类型。
mapping(uint => address) public address;
mapping(address => address) public pair;
```
