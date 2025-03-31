const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CrowdFundingModule", (m) => {
  const crowdfunding = m.contract("CrowdFunding", []);

  return { crowdfunding };
});
