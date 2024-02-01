const { createHash } = require("crypto");

/**
 * 
 * @param {string} schemaPath 
 * @returns {string}
 */
const getProjectHash = (schemaPath) => {
    return createHash("sha256").update(schemaPath).digest("hex").substring(0, 8);
};

module.exports = getProjectHash
