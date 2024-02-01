'use strict'

const fp = require("fastify-plugin");
const StudioServer = require("./server.js");
const {
    getConfig,
    getDirectUrl,
    resolveUrl,
} = require("@prisma/internals");
const path = require("path");
const fs = require("fs");
const { enginesVersion } = require('@prisma/engines')
const fastifyFormbody = require('@fastify/formbody');
const fastifySession = require('@fastify/session');
const fastifyCookie = require('@fastify/cookie');

const prismaPackageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../prisma/package.json'), 'utf-8'))

/**
 * 
 * @param {import("fastify").FastifyInstance} app 
 * @param {{schemaPath: string, auth: {enabled: boolean, default: {email: string, password: string}, secret: string}}} options 
 */
async function PrismaStudioFastify(app, options) {
    let { schemaPath, auth } = options;
    const schema = await fs.promises.readFile(schemaPath, 'utf-8')
    const config = await getConfig({ datamodel: schema, ignoreEnvVarErrors: true })

    if (auth.enabled) {
        app.register(fastifyFormbody);
        app.register(fastifyCookie);
        app.register(fastifySession, { secret: auth.secret });
    }

    const studio = new StudioServer({
        schemaPath,
        prismaClient: {
            resolve: {
                '@prisma/client': path.resolve(__dirname, '../prisma/prisma-client/index.js'),
            },
            directUrl: resolveUrl(getDirectUrl(config.datasources[0])),
        },
        versions: {
            prisma: prismaPackageJson.version,
            queryEngine: enginesVersion,
        },
        auth: auth.enabled ? auth.default : undefined,
    })
    await studio.start(app)
}
const plugin = fp(PrismaStudioFastify, {
    name: 'prisma-studio-fastify',
    fastify: '^4.0.x'
})

module.exports = plugin
module.exports.default = plugin
module.exports.fastifyOverview = plugin