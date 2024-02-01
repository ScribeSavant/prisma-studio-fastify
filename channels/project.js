
class ProjectChannel {
    constructor(options) {
        this.name = "Prisma Studio";
        this.schemaPath = options.schemaPath;
    }

    respond(
        req
    ) {
        const res = {
            requestId: req.requestId,
            channel: `-${req.channel}`,
            action: req.action,
            payload: {
                error: null,
                data: null,
            },
        };

        switch (req.action) {
            case "get":
                res.payload.data = {
                    name: this.name,
                    schemaPath: this.schemaPath,
                    lastOpenedAt: new Date().toISOString(),
                };
                break;
            case "getAll":
                res.payload.data = [
                    {
                        name: this.name,
                        schemaPath: this.schemaPath,
                        lastOpenedAt: new Date().toISOString(),
                    },
                ];
                break;
        }

        return Promise.resolve(res);
    }
}

module.exports = {
    ProjectChannel
}