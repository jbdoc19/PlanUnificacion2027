run = "npm start"
entrypoint = "server/index.js"
modules = ["nodejs-20"]

[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "npm run build && node server/index.js"]
build = ["sh", "-c", "npm install && npm run build"]
deploymentTarget = "autoscale"

[[ports]]
localPort = 3000
externalPort = 80

[env]
NODE_ENV = "production"
