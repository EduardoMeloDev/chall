const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");


describe("Init", function () {

  let jstak;
  let accounts;
  let adminAddress;
  let _contract;
  let deployedContract;
  let depositAccount;

  beforeEach(async () => {
    // Get accounts

    [adminAddress, depositAccount] = await ethers.getSigners();

    accounts = await ethers.provider.listAccounts();

    _contract = await ethers.getContractFactory("ETHPool");

    deployedContract = await _contract.deploy(adminAddress.address);

  });


  describe("Deposit", function () {
    it("Should set the first deposit", async function () {

      await deployedContract.deposit(deployedContract.address, { value: ethers.utils.parseEther("1") });
      expect(await deployedContract.totalStaked()).to.equal(ethers.utils.parseEther("1"));

    });

    it("Should verify if totalStaked is greater than 0", async function () {

      await deployedContract.deposit(deployedContract.address, { value: ethers.utils.parseEther("1") });

      await deployedContract.depositRewards( { value: ethers.utils.parseEther("1") });

      const _reward = await deployedContract.calculateReward(adminAddress.address);

      expect(Number(_reward)).to.be.greaterThan(0);

    });


  });

  describe("Rewards", function () {
    
    it("Should balance of user greater thant from initial after get reward", async function () {

      await deployedContract.deposit(deployedContract.address, { value: ethers.utils.parseEther("1") });

      await deployedContract.depositRewards( { value: ethers.utils.parseEther("1") });

      const oldBalance = await adminAddress.getBalance();

      await deployedContract.getReward(adminAddress.address);

      const newBalance = await adminAddress.getBalance();

      expect(Number(newBalance)).to.be.greaterThan(Number(oldBalance));

    });


  });

  describe("root account Team Role", function () {
    const _role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ONLY_TEAM'))

    it("Should account needs to have Team Role", async function () {

      const isTeam = await deployedContract.hasRole(_role, adminAddress.address);

      expect(isTeam).to.equal(true);
    });

  });

  describe("adding new account Team Role", function () {
    const _role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ONLY_TEAM'))

    it("Should account needs to have Team Role", async function () {

      await deployedContract.grantRole(_role, depositAccount.address);

      const isTeam = await deployedContract.hasRole(_role, depositAccount.address);

      expect(isTeam).to.equal(true);
    });

    it('Should revert if the user does not have TEAM ROLE to using revoke function', async function () {

      const role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ONLY_TEAM'))

      await deployedContract.revokeRole(role, adminAddress.address);

      await expect(deployedContract.depositRewards({ value: ethers.utils.parseEther("1") })).to.be.revertedWith('Restricted to Team.');

    });

  });

  describe("adding new account Team Role", function () {
    const _role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ONLY_TEAM'))

    it("Should account needs to have Team Role", async function () {

      await deployedContract.grantRole(_role, depositAccount.address);

      const isTeam = await deployedContract.hasRole(_role, depositAccount.address);

      expect(isTeam).to.equal(true);
    });


  });

});

