module.exports = {
  apps: [
    {
      name: "abc-store",
      script: "npm",
      args: "start",            // runs your "start" script (Next.js -> starts on 3000 by default)
      cwd: "/home/administrator/abc-store",// set to your app path (Windows e.g. "C:/apps/abc-store")
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 4,             // or "max" for all CPU cores
      exec_mode: "fork",        // or "cluster" for stateless apps
      watch: false,             // keep false in prod
      max_memory_restart: "1G"
    }
  ]
}
