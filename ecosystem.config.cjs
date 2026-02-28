module.exports = {
  apps: [
    {
      name: "morning-glow",
      script: "dist/server.js",   // 如果你是 node server.js 就写 "server.js"
      // args: "",                // 有额外参数可以在这里加
      instances: 1,               // 或 "max" 使用所有 CPU
      exec_mode: "fork",          // 多进程可以用 "cluster"
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
        // 这里也可以写环境变量，比如：
        // PORT: "3000",
        // API_KEY: "xxx"
      }
    }
  ]
};
