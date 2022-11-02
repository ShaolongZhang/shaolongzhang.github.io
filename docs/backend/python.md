---
order: 3
toc: menu
title: Python服务技术
---

## Json-rpc 服务

### json-rpc 简介

`JSON-RPC`是一个无状态且轻量级的远程过程调用(`RPC`)协议，其请求和返回的格式都是 json 格式。最近看了好多开源的项目，提供的服务都是 json 格式，其请求格式如下：

```bash
{ "method": "方法名", "params": [“参数数组”], "id":  方法ID}
```

- method 就是暴露的 rpc 的方法
- params 就是方法请求的参数
- id 方法请求的 id

### 搭建服务

- 安装需要的 python 包，这里测试我们用的版本是`python3.6`

```bash
pip install json-rpc
```

- 开发 json rpc 的 python service 端

```python
   # coding: utf-8

from werkzeug.wrappers import Request, Response
from werkzeug.serving import run_simple

from jsonrpc import JSONRPCResponseManager, dispatcher


@dispatcher.add_method
def hello():
  '''
  测试的一个rpc方法
  :return:
  '''
  return "this is python test"

@Request.application
def application(request):
  '''
   服务的主方法，handle里面的dispatcher就是代理的rpc方法，可以写多个dispatcher
  :param request:
  :return:
  '''
  response = JSONRPCResponseManager.handle(
      request.get_data(cache=False, as_text=True), dispatcher)
  return Response(response.json, mimetype='application/json')

if __name__ == '__main__':
  run_simple('localhost', 9090, application)
```

- 开发 json rpc 的 python client 端

```python
# coding: utf-8


import requests
import json


def main():
    url = "http://localhost:9090/jsonrpc"
    headers = {'content-type': 'application/json'}
    payload = {
        "method": "hello",
        "params": [],
        "jsonrpc": "1.0",
        "id": 0,
    }
    response = requests.post(
        url, data=json.dumps(payload), headers=headers).json()
    print("response:",json.dumps(response))

if __name__ == "__main__":
    main()
```

- 测试结果
  首先启动 service 端，然后执行 client 端，我们可以得到返回结果：

```bash
response: {"result": "this is python test", "id": 0, "jsonrpc": "2.0"}
```

也可以在终端直接执行命令请求：

```bash
 curl localhost:9090/jsonrpc  --data '{"jsonrpc":"1.0", "method":"hello", "params":[], "id":1}'
```

### 其他

这里只是简单的启动搭建的一个 python jsonrpc 服务，关于 python jsonrpc 的包有多种，每个的使用方法都不太一样，具体的也要根据业务实际情况去处理，我们只是简单模拟了整个请求过程，对于想用 python 提供 rpc 服务的可以试试

## Grpc 服务

### Grpc 简介

`gRPC`是一个高性能、通用的开源 RPC 框架，其由 Google 主要面向移动应用开发并基于`HTTP/2`协议标准而设计，基于`ProtoBuf`序列化协议开发，且支持众多开发语言。具体大家可以在 gRPC 的官网查看

### 搭建服务

- 我们用的`python3.6`，第一步淡然是安装 python 需要的库

```bash
pip install grpcio
pip install grpcio-tools  主要是为了将pb编译python
pip install protobuf
```

- 开发 protobuf 文件，protobuf 版本用的 proto3。名称位 test.proto

```bash
syntax = "proto3";

option cc_generic_services = true;

service GrpcService {
    rpc hello (HelloRequest) returns (HelloResponse) {}
}

//请求的pb
message HelloRequest {
    string data = 1;
};

//返回的对象
message HelloResponse {
    string result = 1;
};
```

- 开发完成后，我们要将 pb 文件转化成 python 文件，直接在当前文件目录下面执行

```bash
python -m grpc_tools.protoc -I./ --python_out=./ --grpc_python_out=./  ./test.proto
```

执行完后会生成一个 test_pb2.py 和 test_pb3_grpc.py

- 接下来我们开发 grpc 的服务端,service.py

```python
#! /usr/bin/env python
# coding=utf8

import time
from concurrent import futures

import grpc

from service import test_pb2_grpc, test_pb2

_ONE_DAY_IN_SECONDS = 60 * 60 * 24


class TestService(test_pb2_grpc.GrpcServiceServicer):
    '''
    继承GrpcServiceServicer,实现hello方法
    '''
    def __init__(self):
        pass

    def hello(self, request, context):
        '''
        具体实现hello的方法，并按照pb的返回对象构造HelloResponse返回
        :param request:
        :param context:
        :return:
        '''
        result = request.data + " this is gprc test service"
        return test_pb2.HelloResponse(result=str(result))



def run():
    '''
    模拟服务启动
    :return:
    '''
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    test_pb2_grpc.add_GrpcServiceServicer_to_server(TestService(),server)
    server.add_insecure_port('127.0.0.1:9098')
    server.start()
    print("start service...")
    try:
        while True:
            time.sleep(_ONE_DAY_IN_SECONDS)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    run()
```

- 继续开发 grpc 的客户端请求，client.py

```python
#! /usr/bin/env python
# coding=utf8

import grpc

from service import test_pb2_grpc, test_pb2


def run():
    '''
    模拟请求服务方法信息
    :return:
    '''
    conn=grpc.insecure_channel("127.0.0.1:9098")
    client = test_pb2_grpc.GrpcServiceStub(channel=conn)
    respnse = client.hello(test_pb2.HelloRequest(data="xiao li"))
    print("received:",respnse.result)

if __name__ == '__main__':
    run()
```

- 测试结果
  先启动 service.py 服务，然后执行 client.py，会直接返回

```bash
received: xiao li this is gprc test service
```

### 其他

这里只是一个简单的`grpc`服务简单，具体我们可以通过`http`的形式暴露成`http`的接口对外访问，实际中要根据业务场景，对外提供不同的`grpc`服务
