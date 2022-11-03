---
order: 4
toc: menu
title: 服务内简单的Trace埋点
---

目前业务开源的 SpringBoot，Dubbo 都有相应的 trace 埋点功能，方便我们开发系统查询问题，基本的功能都是将 trace 日志，通过 ELK 可视化出来，完成初步的 Trace 服务。这里我们讲下服务内的方法 Trace 埋点

## 技术选型

- 栈 stack 算法结构
  > 栈后进先出的数据结构，符合我们 trace，树状结构从最里层到最外层的打印。根据先请求的方法，可以生成请求 tradeId，并压栈，方法内存在调用其他标记的方法，并相应的做压栈处理，在整个方法请求完成之后，在统一做出栈处理
- 拦截器
  > 拦截器主要是用来记录请求的方法堆栈信息，方便统计时间信息；拦截器是整个请求处理的核心，通过拦截器可以对请求的方法生成 Trace 模型，并做进一步的处理

## 基础的开发

- 定义基础的数据模型，`TraceMessage`的基础数据结构

```bash
    /**  方法名称 */
    private String methodName;

    /** 方法统一的请求标记*/
    private String traceId;

    /**  耗时 */
    private long time = -1l;

    /**  开始时间 */
    private long startTime;

    /**  请求参数 */
    private String request;

    /**  返回参数 */
    private String response;
```

- 定义一个基础的注解`Monitor`，将有注解的方法都纳入到统计的范围之内

```bash
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Monitor {
    /**
     * 打点统计的方法数据
     * @return
     */
    String value() default "";
}
```

- 定义一个基础的拦截器`MonitorFilter`，用户拦截要统计打点的方法

```bash
@Around(value = "@annotation(monitor)")
public Object around(ProceedingJoinPoint point, Monitor monitor) throws Throwable {
        try {
            //TODO 处理方法的拦截请求
        } catch(Throwable e) {
            //TODO  处理异常的请求
        }finally {
            //TODO  处理最后的日志打印请求
        }
}
```

- 定义一个核心的处理方法类，定义个包含`start()`和`stop()`两个方法，其中`start()`是开始采集，`stop()`是停止采集，定义个`handler()`方法，主要的作用是处理采集结果信息</br>

1. `定义连个栈基础属性，用户存放请求的处理`

```bash
/**
 * 堆栈存储调用关系信息
 */
private NamedThreadLocal<Stack<TraceMessage>> messagesLocal = new NamedThreadLocal<Stack<TraceMessage>>("stack_message");

/**
 * 存储根节点的TraceId
 */
public NamedThreadLocal<String> rootIdLocal = new NamedThreadLocal<String>("interceptorTrace_info");
```

2. `定义start()方法的核心部分`

```bash
public  void start(final String methodName) {
		//判断根节点是否已经存在信息
		if (rootIdLocal.get() == null) {
			//TODO 首次请求，设置rootIdLocal信息
		}
        if (messagesLocal.get() == null) {
			//判断堆栈信息是否有值
			没有值就设置messagesLocal 设置本次的栈信息,并入栈
		} else {
			//TODO将本次请求的值入栈处理
		}
}
```

3. `定义stop()方法的核心部分`

```bash
	public  void stop() {
        //判断是否已经有栈信息
        if （messagesLocal.get() == null） {
            return;
        }
        //判断是否已经处理完成
        if (stack.firstElement().getTime == -1){
            return; //表示没有处理完成
        }
        //TODO 栈进行出栈打印日志，线程并释放当前的栈信息
}

```

4. `定义handle()方法的核心部分`

```bash
public  void handleResult(String request, String response) {
        // 获取当前未处理到的TraceMessage
		TraceMessage message = unReleaseMessage();
        // 设置消息的处理时间，请求结果信息
		if (message != null) {
			message.setRequest(request);
			message.setResponse(response);
			message.setTime(Long.valueOf(
					System.currentTimeMillis() - message.getStartTime())
					.intValue());
		}
}
```

至此一个简单的内部 Trace 流程就搭建完成，整个流程整体思路和搭建一个分布式的 Trace 系统流程大同小异。

## 其他

这个只是简单的介绍了一个内部方法请求的 Trace 请求的思路，要搭建一个完整的微服务`Trace`请求，需要有采集，处理，可视化核心组件，同时需要兼顾抽样采集，Http 请求采集，多线程请求链路的采集，甚至包括 Mq 消息队列数据采集。具体的处理需要根据服务，团队的规模进行技术选型。
