---
order: 3
toc: menu
title: 简单的监控系统
---

微服务系统架构中，监控是必不可少的环境，大厂都会根据自己的业务系统架构，搭建符合自身业务需求的监控，我们自己根据市面上开源的软件，搭建属于我们的可视化监控平台

## 技术选型

- `prometheus`
  > ​Prometheus 是由前 Google 工程师从 2012 年开始在 Soundcloud 以开源软件的形式进行研发的系统监控和告警工具包，自此以后，许多公司和组织都采用了 Prometheus 作为监控告警工具。
- `Grafana`
  > Grafana 是一个监控仪表系统，它是由 Grafana Labs 公司开源的的一个系统监测 (System Monitoring) 工具。它可以大大帮助你简化监控的复杂度，你只需要提供你需要监控的数据，它就可以帮你生成各种可视化仪表。
  > 我们采集选择`prometheus` 开源软件，可视化选择`Grafana` 开源软件

## 基础搭建

- `prometheus` 搭建
  `prometheus`可以采用二进制和 docker 进行安装，我们为了方便配置，采用二进制方式进行安装，通过 prometheus 的官网，我们下载最新版本的 prometheus 版本进行安装，https://prometheus.io/download/

```bash
tar -zxvf prometheus-2.39.1.linux-amd64.tar.gz -C /usr/local/
mv /usr/local/prometheus-2.39.1.linux-amd64/  /usr/local/prometheus
```

直接启动服务

```bash
/usr/local/prometheus/prometheus --config.file="/usr/local/prometheus/prometheus.yml" &
```

通过浏览器访问 http://服务器:9090 就可以访问主界面

- `Grafana` 搭建
  `Grafana` 可以采用二进制和 docker 进行安装，为了测试方便我们直接采用 docker 进行安装，登录 dockerhub 查看需要的 grafana 版本

```bash
docker run --name=test-grafana -d \
-p 3000:3000 \
grafana/grafana:6.7.4
```

通过浏览器访问 http://服务器:3000 就可以访问主界面

## 基础配置

我们将`prometheus`和`Grafana`关联起来，具体需要在`Grafana`的数据源中选择`prometheus`为数据来源，具体的一些配置就不在这里详细介绍，有感兴趣的可以网上搜素下

## 服务接入

`prometheus`支持多语言的接入，我们这里使用 java 进行接入，假如我们的业务需求去要统计服务的耗时，QPS 等基础的一些统计信息，我们采用`prometheus`提供的基础统计

- 计数器（`Counter`）：一种累计型的度量指标，它是一个只能递增的数值。计数器主要用于统计类似于服务器请求数、任务完成数和错误出现次数这样的数据。
- 计量器（`Gauge`）：表示一个既可以增加，又可以减少的度量指标。计量器主要用于测量类似于温度、内存使用量这样的瞬时数据。
- 直方图（`Histogram`）：对观察结果进行采样（通常是请求持续时间或者响应大小这样的数据），并在可配置的桶中进行统计。

### 服务配置

我们简单的用 Java 开发的一个网关服务，在网关服务做一些简单的服务数据采集

- pom 引入

```bash
<!-- 监控 -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-core</artifactId>
</dependency>
 <dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

- yml 文件修改
  需要将 spring 的采集接口打开，方便服务进行数据采集，其中配置/actuator 为数据采集接口

```bash
management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,metrics
      base-path: /actuator
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: xxxx-service
```

### 应用端开发

定义一个简单的 Monitor 类，需要初始化一些指标数据

```bash
    @Autowired
    private CollectorRegistry collectorRegistry;

    /**
     * 请求数
     */
    private Counter totalCounter;

    /**
     * 失败数
     */
    private Counter failCounter;

    /**
     * 耗时时间
     */
    private Histogram duration;

    @PostConstruct
    private void  register() {
        totalCounter = Counter.build().name("server_http_count").help("http_count").labelNames("app","host","api").register(collectorRegistry);
        failCounter = Counter.build().name("server_http_fail_count").help("http_fail").labelNames("app","host","api","error").register(collectorRegistry);
        duration = Histogram.build().name("server_http_time").help("http_time").labelNames("app","host","api").register(collectorRegistry);
    }
```

其中

```bash
Counter.build().name("server_http_count").help("http_count").labelNames("app","host","api").register(collectorRegistry);
```

- totalCounter 代表我们注册了一个名字叫`server_http_count`的 counter 指标，指标包含 app 应用名称，host 服务地址，api 请求接口
- failCounter 代表我们注册了一个名字叫`server_http_fail_count`的 counter 指标，指标包含 app 应用名称，host 服务地址，api 请求接口
- duration 代表我们注册了一个名字叫`server_http_time`的 Histogram 指标，指标包含 app 应用名称，host 服务地址，api 请求接口

定义一个全局的`GlobalFilter`，在入口监控请求的 api 接口

```bash
/**
 * QPS统计
 */
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest serverHttpRequest = exchange.getRequest();
        String uri = serverHttpRequest.getURI().getPath();
        monitorHandle.addReq(uri);
}
```

也可以重新定义一个单独的时间`GlobalFilter`，统计请求的耗时

```bash
/**
 * 耗时统计
 */
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        exchange.getAttributes().put(START_TIME, System.currentTimeMillis());
return chain.filter(mutableExchange).then(Mono.fromRunnable(() -> {
            Long startTime = exchange.getAttribute(START_TIME);
            String path = exchange.getRequest().getPath().pathWithinApplication().value();
            monitorHandle.addTime(path,executeTime);
        }));
}
```

对于失败的定义一般都是采用不同的 code 码代表失败，可以在 header 添加上失败的错误码，在网关层做统计的埋点，这块就不详细列出

### 采集端配置

应用已经集成了 prmetheus 的相关组件，要使整个功能完全跑通，需要修改 prmetheus 的配置，这块采用最简单的单机节点配置，对于集群的部署，不建议采用该方式.
修改 prmetheus.yaml 文件，添加一个 job 任务

```bash
- job_name: "prometheus-gateway"
  metrics_path: "/actuator/prometheus"
  static_configs:
    - targets: ["127.0.0.1:10825"]
```

- job_name 是任务名称这个可以根据自己业务起名称
- metrics_path 就是我们对外暴露的采集接口，这个是自定义的
- static_configs 就是我们需要采集的服务，可以是个集群服务节点
  重启`prometheus`服务，或者 reload 配置就可以生效，这样我们一个简单的监控服务就搭建完成，不过要想 reload 生效，需要在启动`prometheus`添加

```bash
--web.enable-lifecycle
```

这样就可以不用重启服务就可以更新配置，直接调用,只接收 Post 请求的方式

```
curl -XPOST http://xxxxx/-/reload
```

## 其他

这里只是很简单的搭建了一个监控服务，具体在实际业务过程总，服务都需要集群化部署，提高服务的高可用性；不管是采集端还是可视化层，都需要确保服务的稳定性，同时`Grafana`也支持基础的一些报警功能，可以通过采集的数据，做一些报警处理。
