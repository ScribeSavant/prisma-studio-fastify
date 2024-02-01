const { PCW, loadEnvironment } = require("@prisma/studio-pcw");
const { readFileSync } = require("fs");


class PrismaChannel {
    constructor(options) {
        this.options = options;
        this.schema = readFileSync(options.schemaPath, "utf-8");

        // Load environment variables relative to this `schemaPath` to `process.env`
        loadEnvironment(this.options.schemaPath);

        this.pcw = new PCW(
            this.schema,
            options.schemaPath,
            {},
            { ...options.prismaClient },
            options.versions
        );
    }

    respond = async (
        req
    ) => {
        const res = {
            requestId: req.requestId,
            channel: `-${req.channel}`,
            action: req.action,
            payload: {
                error: null,
                data: null,
            },
        };

        try {
            switch (req.action) {
                case "getDMMF":
                    const { dmmf } = await this.pcw.getDMMF();
                    res.payload.data = {
                        dmmf,
                        schemaHash: this.pcw.schemaHash,
                    };
                    break;
                case "clientRequest":
                    // First check the schema hash to make sure the query being made is made against the correct schema
                    if (
                        req.payload.data.schemaHash &&
                        req.payload.data.schemaHash !== this.pcw.schemaHash
                    ) {
                        res.payload.error = {
                            type: "PrismaClientSchemaDriftedError",
                            code: "P500",
                            message:
                                "The underlying schema has changed. Please reload Studio.",
                            stack: "",
                        };
                    } else {
                        res.payload.data = (await this.pcw.request(
                            req.payload.data
                        ));
                    }
                    break;
            }
        } catch (e) {
            // Convert this Error object into a POJO so it can be transmitted
            res.payload.error = {
                type: e.type,
                code: e.code,
                message: e.message,
                stack: e.message,
            };
        }

        return res;
    };
}

module.exports = {
    PrismaChannel
}