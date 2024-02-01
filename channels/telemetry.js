const { check, getSignature } = require("checkpoint-client");
const getProjectHash = require("../utils/getProjectHash.js")


class TelemetryChannel {

    constructor(options) {
        this.options = {
            schemaPath: options.schemaPath,
            telemetry: options.telemetry ?? true,
            versions: options.versions,
        };

        // Ensure a signature exists
        getSignature().then(() => {
            // And send a `studio_launch` event
            this.send({
                command: "studio_launch",
                commandDetails: {},
                commandContext: "{}",
            });
        });
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
                case "send":
                    await this.send(req.payload.data);
                    break;
            }
        } catch (e) {
            // Convert this Error object into a POJO so it can be transmitted
            res.payload.error = e.message;
        }

        return res;
    };

    send = async ({
        command,
        commandDetails,
        commandContext,
    }) => {
        if (!this.options.telemetry) {
            // Do not send telemetry if it is disabled
            return;
        }

        if (!this.options.versions) {
            // Insufficient context, bail
            return;
        }

        // TODO:: Need to start reporting `commandDetails` & `commandContext`
        check({
            product: "prisma-studio",
            command,
            version: this.options.versions.prisma,
            project_hash: getProjectHash(this.options.schemaPath),
        });
    };
}

module.exports = {
    TelemetryChannel
}