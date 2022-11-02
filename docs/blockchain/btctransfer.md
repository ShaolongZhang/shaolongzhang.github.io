---
order: 6
toc: menu
title: 简单比特币转账
---

## 比特币转账

和其他数字货币一样，比特币提供了我们底层的转账接口，当我们已经搭建完本地的节点服务，也已经大概了解了 json-rpc 的东西，那我们接下了看看比特币是怎么转账的

## 转账功能开发

看了比特币提供的 rpc 接口，简单的转账分三步走

1. `createrawtransaction`
2. `fundrawtransaction`
3. `signrawtransaction`
4. `sendrawtransaction`
   **创建签名交易**->**检查交易费用**->**签名交易**->**发送交易**
   其中第二部分，如果是个人钱包转账其实不用，我们可以在 createrawtransaction 设置好交易费用
   > 小明的钱包里面有 1 个比特币，要将 0.5 个转账给小李，来吧我们帮他实现，不过小明的 1 个比特币是从其他地址转入的 0.8 和 0.2 个，没关系我们也能帮助他转账

- 首先需要先检索小明钱包有 0.5 个 btc 没有，我们调用 btc 提供的 getbalance 方法

```bash
    /**
     * 获取钱包地址余额
     *
     * @return
     */
    public JSONObject getBalance(String address) {
        Object[] params = new Object[3];
        params[0] = address
        params[1] = 6; //这是设置6是确保钱包里面的前都是已经经过区块确认的
        params[2] = true;
        JSONObject jsonObject = null;
        try {
            jsonObject = jsonrpcService.callMethod(BTCMethod.GET_BALANCE.toString(), params, JSONObject.class);
        } catch (Throwable throwable) {
            logger.error("getBalance error", throwable);
        }
        return jsonObject;
    }
```

- 检查小明的钱包的 btc 是大于 0.5 个比特币的，那我们接着看他钱包的没有发送的的交易有哪些，这个时候调用 btc 提供的 listunspent 方法

```bash
    /**
     * object     {
     "minimumAmount"    (numeric or string, default=0) Minimum value of each UTXO in BTC
     "maximumAmount"    (numeric or string, default=unlimited) Maximum value of each UTXO in BTC
     "maximumCount"     (numeric or string, default=unlimited) Maximum number of UTXOs
     "minimumSumAmount" (numeric or string, default=unlimited) Minimum sum value of all UTXOs in BTC
     }
     * @param minconf
     * @param maxconf
     * @param address
     * @param object
     * @return
     */
    public JSONObject listUnspent(int minconf, int maxconf, List<String> address,Object object)  {
        Object[]  params = new Object[5];
        params[0] = minconf; //最小的金额
        params[1] = maxconf; //最大的金额
        params[2] = address; //地址
        params[3] = true;
        params[4] = object;
        JSONObject jsonObject = null;
        try {
            jsonObject = jsonrpcService.callMethod(BTCMethod.LIST_UNSPENT.toString(), params,JSONObject.class);
        } catch (Throwable throwable) {
            logger.error("listUnspent error",throwable);
        }
        return jsonObject;
    }
```

- 检测小明的钱包有两笔 unspent,通过返回的 txid,和 vout，scriptPubKey，amount 我们就可以创建一个 createrawtransaction

```bash
    //创建的一个输入，txid和vout就是第二步返回的值
    TxInput input = new BTCTranscation.BasicTxInput(us.getTxid(), us.getVout());

    /**
     * 需要设置找零地址信息
     * @param recipientAddress
     * @param amountSend
     * @param sendeAddress
     * @param amountChange
     * @return
     */
    public List<TxOutput> createTxOutput(String recipientAddress,BigDecimal amountSend,String sendeAddress,BigDecimal amountChange) {
        List<TxOutput> outputs = new ArrayList<TxOutput>();
        outputs.add(new BTCTranscation.BasicTxOutput(recipientAddress, getDouble(amountSend))); //设置需要接收的地址和币数量
        outputs.add(new BTCTranscation.BasicTxOutput(sendeAddress, getDouble(amountChange))); //设置需要找零的地址和币数量
        return outputs;
    }
```

> 备注：这里记得一定要设置找零地址，因为小明的 unsend 的交易是 0.8 个，我们给小李要转 0.5 个还剩余 0.3 个，如果不设置找零地址，0.3 个就默认都成为矿工费了，找零的币是减去矿工费计算的出来的,我们可以调用 btc 的 estimatesmartfee 方法简单计算矿工费

```bash
    /**
     * 获取费率信息
     * @param minconf
     * @return
     */
    public JSONObject estimatesmartfee(int minconf)  {
        Object[]  params = new Object[1];
        params[0] = minconf;
        JSONObject jsonObject = null;
        try {
            jsonObject = jsonrpcService.callMethod(BTCMethod.ESTIMATES_MARTFEE.toString(), params,JSONObject.class);
        } catch (Throwable throwable) {
            logger.error("listUnspent error",throwable);
        }
        return jsonObject;
    }
```

- 创建一笔交易信息，根据我们构造好输入输出，我们创建 transaction，这个时候调用 btc 提供的 createrawtransaction 方法

```bash
 /**
     * 创建交易信息，返回hash 值 ,发送格式：需要计算好找零钱的信息
     *
     * '[{"txid" : "5d2abd13a6ee2d3ffb1758259eb5d0ffece91a86c0670f1e6c472618995a420c", "vout" : 1}]' '{"mj7AFvkxFEvxmGwwP5jgXRtyzhPAhZs2gQ": 0.0005, "my1kprdpM17PZJnB55GwJ5AzLGjx9isHh9": 0.000045}'
     * @param prevOut
     * @param out
     * @return
     */
    public JSONObject createRawTransaction(Object[] prevOut, Object out) {
        Object[]  params = new Object[2];
        params[0] = prevOut;
        params[1] = out;
        JSONObject jsonObject = null;
        try {
            jsonObject = jsonrpcService.callMethod(BTCMethod.CREATE_RAW_TRANSACTION.toString(), params,JSONObject.class);
        } catch (Throwable throwable) {
            logger.error("createRawTransaction error",throwable);
        }
        return jsonObject;
    }
```

- 加密交易信息，根据上一部返回的 hex 值，我们进行加密，这个时候调用 btc 提供的 signrawtransaction 方法

```bash
    /**
     * 交易签名
     * @param hexString
     * @return
     */
    public JSONObject signRawTransaction(String hexString)  {
        Object[] params = new Object[1];
        params[0] = hexString;
        JSONObject jsonObject = null;
        try {
            jsonObject = jsonrpcService.callMethod(BTCMethod.SIGN_RAW_TRANSACTION.toString(), params, JSONObject.class);
        } catch (Throwable throwable) {
            logger.error("signRawTransaction error",throwable);
        }
        return jsonObject;
    }
```

- 小李催着要 btc 了，那我们赶紧给他发送到 btc 网络上吧，这个时候调用 btc 提供的 sendrawtransaction 方法

```bash
    /**
     * 发送签名的交易信息
     *
     * @param hexString
     * @return
     */
    public JSONObject sendRawTransaction(String hexString)  {
        Object[] params = new Object[1];
        params[0] = hexString;
        JSONObject jsonObject = null;
        try {
            jsonObject = jsonrpcService.callMethod(BTCMethod.SEND_RAW_TRANSACTION.toString(), params, JSONObject.class);
        } catch (Throwable throwable) {
            logger.error("sendRawTransaction error",throwable);
        }
        return jsonObject;
    }
```

返回了一个 hex 值:xxxxxxxx，给小李，让他可以在区块浏览器上查看转账进度了

## 后续

这里只是简单的开发了一个比特币转账的流程，具体实际中可能会遇到各种问题，尤其是矿工费计算之类的；如果是交易所之类的转账，应该基本上都是签名和发送都是隔离的，因为签名不需要网络，只需要账户的私钥。流程上搞懂了，其实感觉也没有那么复杂，测试的时候直接用的是本地搭建的 btc 网络节点测试整个流程。
