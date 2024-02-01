const untildify = require("untildify");
const { gzipSync } = require("zlib");
const { PrismaChannel } = require("./channels/prisma.js");
const { ProjectChannel } = require("./channels/project.js");
const { TelemetryChannel } = require("./channels/telemetry.js");
const { deserializeRPCMessage, serializeRPCMessage } = require("@prisma/studio-common");
const path = require("path");

class StudioServer {
    constructor(options) {
        this.options = options;
        this.options.schemaPath = untildify(this.options.schemaPath);
        this.auth = options.auth;
        this.channels = {
            project: new ProjectChannel(options),
            prisma: new PrismaChannel(options),
            telemetry: new TelemetryChannel(options),
        };
    }

    /**
     * 
     * @param {import("fastify").FastifyInstance} app 
     */
    start = async (app) => {
        try {

            app.register(require('@fastify/static'), {
                root: path.join(__dirname, 'public'),
            })

            app.post("/prisma/api", async (req, reply) => {
                const requestBody = deserializeRPCMessage(req.body);
                const { requestId, channel, action } = requestBody;

                let response

                switch (channel) {
                    case "project":
                        response = await this.channels.project.respond(requestBody);
                        break;
                    case "prisma":
                        response = await this.channels.prisma.respond(requestBody);
                        break;
                    case "telemetry":
                        response = await this.channels.telemetry.respond(
                            requestBody
                        );
                        break;
                    default:
                        response = {
                            requestId,
                            channel: `-${channel}`,
                            action: action,
                            payload: {
                                error: null,
                                data: null,
                            },
                        };
                        break;
                }

                reply.header("Content-Type", "application/json");
                reply.header("Content-Encoding", "gzip");
                reply.send(gzipSync(Buffer.from(serializeRPCMessage(response), "utf8"))); // GZip response since DMMF can be quite large

            });

            app.post("/prisma/login", async (req, reply) => {
                const { email, password } = req.body;
                if (email === this.auth.default.email && password === this.auth.default.password) {
                    console.log("Login successful");
                    req.session.set("prisma-user", { email });
                    await req.session.save();
                    return reply.redirect("/prisma")
                }
                return reply.redirect("/prisma/login")
            })

            app.get("/prisma/login", async (req, reply) => {
                return reply.sendFile("/pages/http/login.html")
            })
            app.get("/prisma", (req, reply) => {
                if (this.auth) {
                    if (!req.session.get("prisma-user")) {
                        return reply.redirect("/prisma/login")
                    }
                }
                return reply.sendFile("/pages/http/databrowser.html")
            })
        } catch (e) {
            console.log("An error occured while starting Studio:", e);
            process.exit(1);
        }
    };
}

module.exports = StudioServer;
