/**
 * Savings Engine – Public API for savings opportunities.
 * Delegates to savingsOpportunities for idle/oversized/unattached/transfer detection.
 */

const {
  getSavingsOpportunities,
  findIdleInstances,
  findOversizedCompute,
  findUnattachedStorage,
  findDataTransferInefficiencies,
} = require("./savingsOpportunities");

module.exports = {
  getSavingsOpportunities,
  findIdleInstances,
  findOversizedCompute,
  findUnattachedStorage,
  findDataTransferInefficiencies,
};
