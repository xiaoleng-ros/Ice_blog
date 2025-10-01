# 多阶段构建 Dockerfile for ThriveX-Server

# ================================
# 构建阶段 - 使用Maven进行编译
# ================================
FROM maven:3.8-openjdk-17-slim AS build-stage

# 设置工作目录
WORKDIR /app

# 复制Maven配置文件
COPY pom.xml .
COPY model/pom.xml ./model/
COPY blog/pom.xml ./blog/

# 下载依赖（利用Docker缓存层优化）
RUN mvn dependency:go-offline -B

# 复制源代码
COPY model/src ./model/src
COPY blog/src ./blog/src

# 编译打包，跳过测试以加快构建速度
RUN mvn clean package -DskipTests -B

# ================================
# 开发阶段 - 完整JDK环境用于开发调试
# ================================
FROM openjdk:17-jdk-slim AS development-stage

# 安装基本工具（简化版本以避免网络问题）
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 创建非root用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 设置工作目录
WORKDIR /app

# 从构建阶段复制编译好的jar文件
COPY --from=build-stage /app/blog/target/*.jar app.jar

# 设置文件权限
RUN chown -R appuser:appuser /app

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 9003

# 开发环境启动命令（支持远程调试）
CMD ["java", "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005", "-jar", "app.jar", "--spring.profiles.active=dev"]

# ================================
# 生产阶段 - 轻量级运行时环境
# ================================
FROM openjdk:17-jre-slim AS production-stage

# 安装必要的运行时工具
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 创建非root用户（安全最佳实践）
RUN groupadd -r appuser && useradd -r -g appuser -m appuser

# 设置工作目录
WORKDIR /app

# 从构建阶段复制编译好的jar文件
COPY --from=build-stage /app/blog/target/*.jar app.jar

# 创建日志目录
RUN mkdir -p /app/logs

# 设置文件权限
RUN chown -R appuser:appuser /app

# 切换到非root用户
USER appuser

# 暴露应用端口
EXPOSE 9003

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9003/actuator/health || exit 1

# 生产环境启动命令
CMD ["java", \
     "-server", \
     "-Xms512m", \
     "-Xmx1024m", \
     "-XX:+UseG1GC", \
     "-XX:+UseContainerSupport", \
     "-XX:MaxRAMPercentage=75.0", \
     "-Djava.security.egd=file:/dev/./urandom", \
     "-Dspring.profiles.active=pro", \
     "-jar", \
     "app.jar"]

# ================================
# 默认目标阶段设置为生产环境
# ================================
FROM production-stage