# Prisma Studio Fastify Plugin

This Fastify plugin provides an integrated version of Prisma Studio for Fastify applications. It also includes user authentication features.


## Warning
Before using this plugin, ensure that your Prisma database has been initialized and your models have been generated. It is essential to have your database schema set up and your models defined properly before integrating Prisma Studio with Fastify using this plugin.


## Installation

```bash
npm install fastify prisma-studio-fastify 
//or 
npm install git+https://github.com/scribesavant/prisma-studio-fastify.git
```

## Example
```javascript
const fastify = require("fastify")({ logger: true })
const PrismaStudioFastify = require("prisma-studio-fastify")
const path = require("path")

fastify.register(PrismaStudioFastify, {
    schemaPath: path.join(__dirname, "prisma/schema.prisma"),
    auth: {
        enabled: true,
        default: {
            email: "prisma@prisma.com",
            password: "prisma"
        },
        secret: `a secret with minimum length of 32 characters` // required when auth is enabled
    }
})

fastify.get("/", (req, res) => {
    res.send("Hello World")
})

fastify.listen({ port: 3000 }, (err, address) => {
    console.log(err || "Server started on 3000") // prisma path is https://url:3000/prisma
})
```

## Screenshots
![1](/img/screenshot1.png)
![1](/img/screenshot2.jpg)
![1](/img/screenshot3.png)