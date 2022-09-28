const NOAP = artifacts.require("NOAP");

module.exports = function (deployer,network, accounts) {
  deployer.deploy(NOAP,{from: accounts[0]});
};
