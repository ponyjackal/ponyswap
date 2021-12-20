require("@nomiclabs/hardhat-waffle");
const { expect } = require("chai");
const {
  experimentalAddHardhatNetworkMessageTraceHook,
} = require("hardhat/config");

const toWei = (value) => ethers.utils.parseEther(value.toString());

const fromWei = (value) =>
  ethers.utils.formatEther(
    typeof value === "string" ? value : value.toString()
  );

const getBalance = ethers.provider.getBalance;

describe("Exchange", () => {
  let owner;
  let user;
  let exchange;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("Token", "TKN", toWei(1000000));
    await token.deployed();

    const Exchange = await ethers.getContractFactory("Exchange");
    exchange = await Exchange.deploy(token.address);
    await exchange.deployed();
  });

  it("is deployed", async () => {
    expect(await exchange.deployed()).to.equal(exchange);
  });

  describe("addLiquidity", async () => {
    it("adds liquidity", async () => {
      await token.approve(exchange.address, toWei(200));
      await exchange.addLiquidity(toWei(200), { value: toWei(100) });

      expect(await getBalance(exchange.address)).to.equal(toWei(100));
      expect(await exchange.getReserve()).to.equal(toWei(200));
    });
  });

  describe("getPrice", async () => {
    it("returns correct prices", async () => {
      await token.approve(exchange.address, toWei(2000));
      await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });

      const tokenReserve = await exchange.getReserve();
      const etherReserve = await getBalance(exchange.address);

      //ETH per token
      expect(await exchange.getPrice(etherReserve, tokenReserve)).to.eq(500);

      //token per ETH
      expect(await exchange.getPrice(tokenReserve, etherReserve)).to.eq(2000);
    });
  });

  describe("getTokenAmount", async () => {
    it("returns correct token amount", async () => {
      await token.approve(exchange.address, toWei(2000));
      await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });

      let tokensOut = await exchange.getTokenAmount(toWei(1));
      expect(fromWei(tokensOut)).to.equal("1.998001998001998001");

      tokensOut = await exchange.getTokenAmount(toWei(100));
      expect(fromWei(tokensOut)).to.equal("181.818181818181818181");

      tokensOut = await exchange.getTokenAmount(toWei(1000));
      expect(fromWei(tokensOut)).to.equal("1000.0");
    });
  });

  describe("getEthAmount", async () => {
    it("returns correct ether amount", async () => {
      await token.approve(exchange.address, toWei(2000));
      await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });

      let ethOut = await exchange.getEthAmount(toWei(2));
      expect(fromWei(ethOut)).to.equal("0.999000999000999");

      ethOut = await exchange.getEthAmount(toWei(100));
      expect(fromWei(ethOut)).to.equal("47.619047619047619047");

      ethOut = await exchange.getEthAmount(toWei(2000));
      expect(fromWei(ethOut)).to.equal("500.0");
    });
  });
});
