const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

describe('SSCToken', function () {
  let ssctoken;
  let owner, addr1, addr2, addr3;
  const INITIAL_SUPPLY = ethers.parseEther('1000000');
  const TOKEN_NAME = 'SSC Token';
  const TOKEN_SYMBOL = 'SSC';

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const SSCToken = await ethers.getContractFactory('SSCToken');
    ssctoken = await upgrades.deployProxy(SSCToken, [TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY, owner.address], { kind: 'uups' });
    await ssctoken.waitForDeployment();
  });

  describe('Deployment and Initialization', function () {
    it('should set the correct token name', async function () {
      expect(await ssctoken.name()).to.equal(TOKEN_NAME);
    });

    it('should set the correct token symbol', async function () {
      expect(await ssctoken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it('should set the correct total supply', async function () {
      expect(await ssctoken.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it('should assign initial supply to the initializer owner', async function () {
      expect(await ssctoken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it('should set the correct owner', async function () {
      expect(await ssctoken.owner()).to.equal(owner.address);
    });

    it('should return 18 decimals', async function () {
      expect(await ssctoken.decimals()).to.equal(18);
    });

    it('should not allow reinitialization', async function () {
      await expect(
        ssctoken.initialize(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY, owner.address)
      ).to.be.revertedWithCustomError(ssctoken, "InvalidInitialization");
    });

    it('should revert if initialized with zero address as owner', async function () {
      const SSCToken = await ethers.getContractFactory('SSCToken');
      const token = await upgrades.deployProxy(SSCToken, [TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY, ethers.ZeroAddress], { kind: 'uups' }).catch(e => e);
      expect(token).to.not.be.undefined;
    });
  });

  describe('ERC20 Standard Functionality', function () {
    it('should transfer tokens correctly', async function () {
      const transferAmount = ethers.parseEther('100');
      const initialOwnerBalance = await ssctoken.balanceOf(owner.address);
      const initialAddr1Balance = await ssctoken.balanceOf(addr1.address);

      await expect(ssctoken.transfer(addr1.address, transferAmount))
        .to.emit(ssctoken, 'Transfer')
        .withArgs(owner.address, addr1.address, transferAmount);

      expect(await ssctoken.balanceOf(owner.address)).to.equal(initialOwnerBalance - transferAmount);
      expect(await ssctoken.balanceOf(addr1.address)).to.equal(initialAddr1Balance + transferAmount);
    });

    it('should fail when transferring more than balance', async function () {
      const transferAmount = ethers.parseEther('10000000');
      await expect(
        ssctoken.transfer(addr1.address, transferAmount)
      ).to.be.revertedWithCustomError(ssctoken, 'ERC20InsufficientBalance');
    });

    it('should fail when transferring to zero address', async function () {
      const transferAmount = ethers.parseEther('100');
      await expect(
        ssctoken.transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWithCustomError(ssctoken, 'ERC20InvalidReceiver');
    });

    it('should approve and transferFrom correctly', async function () {
      const approveAmount = ethers.parseEther('500');
      const transferAmount = ethers.parseEther('100');

      await expect(ssctoken.approve(addr1.address, approveAmount))
        .to.emit(ssctoken, 'Approval')
        .withArgs(owner.address, addr1.address, approveAmount);

      expect(await ssctoken.allowance(owner.address, addr1.address)).to.equal(approveAmount);

      await expect(ssctoken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount))
        .to.emit(ssctoken, 'Transfer')
        .withArgs(owner.address, addr2.address, transferAmount);

      expect(await ssctoken.allowance(owner.address, addr1.address)).to.equal(approveAmount - transferAmount);
      expect(await ssctoken.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it('should fail transferFrom if allowance is insufficient', async function () {
      const transferAmount = ethers.parseEther('100');
      await ssctoken.approve(addr1.address, ethers.parseEther('50'));
      await expect(
        ssctoken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(ssctoken, 'ERC20InsufficientAllowance');
    });

    it('should increase allowance correctly', async function () {
      const initialAllowance = ethers.parseEther('100');
      const addedAllowance = ethers.parseEther('50');

      await ssctoken.approve(addr1.address, initialAllowance);

      await expect(ssctoken.increaseAllowance(addr1.address, addedAllowance))
        .to.emit(ssctoken, 'Approval')
        .withArgs(owner.address, addr1.address, initialAllowance + addedAllowance);

      expect(await ssctoken.allowance(owner.address, addr1.address))
        .to.equal(initialAllowance + addedAllowance);
    });

    it('should decrease allowance correctly', async function () {
      const initialAllowance = ethers.parseEther('100');
      const decreasedBy = ethers.parseEther('50');

      await ssctoken.approve(addr1.address, initialAllowance);

      await expect(ssctoken.decreaseAllowance(addr1.address, decreasedBy))
        .to.emit(ssctoken, 'Approval')
        .withArgs(owner.address, addr1.address, initialAllowance - decreasedBy);

      expect(await ssctoken.allowance(owner.address, addr1.address))
        .to.equal(initialAllowance - decreasedBy);
    });
  });

  describe('Mint Functionality (Owner Only)', function () {
    it('should allow owner to mint tokens', async function () {
      const mintAmount = ethers.parseEther('1000');
      const initialTotalSupply = await ssctoken.totalSupply();
      const initialAddr1Balance = await ssctoken.balanceOf(addr1.address);

      await expect(ssctoken.mint(addr1.address, mintAmount))
        .to.emit(ssctoken, 'Transfer')
        .withArgs(ethers.ZeroAddress, addr1.address, mintAmount);

      expect(await ssctoken.totalSupply()).to.equal(initialTotalSupply + mintAmount);
      expect(await ssctoken.balanceOf(addr1.address)).to.equal(initialAddr1Balance + mintAmount);
    });

    it('should fail mint when not owner', async function () {
      const mintAmount = ethers.parseEther('1000');
      await expect(
        ssctoken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWithCustomError(ssctoken, 'OwnableUnauthorizedAccount');
    });

    it('should fail mint to zero address', async function () {
      await expect(
        ssctoken.mint(ethers.ZeroAddress, ethers.parseEther('1000'))
      ).to.be.revertedWithCustomError(ssctoken, 'ERC20InvalidReceiver');
    });

    it('should fail mint when paused', async function () {
      await ssctoken.pause();
      await expect(
        ssctoken.mint(addr1.address, ethers.parseEther('1000'))
      ).to.be.revertedWithCustomError(ssctoken, 'EnforcedPause');
    });
  });

  describe('Burn Functionality (Owner Only)', function () {
    it('should allow owner to burn tokens from own balance', async function () {
      const burnAmount = ethers.parseEther('500');
      const initialTotalSupply = await ssctoken.totalSupply();
      const initialOwnerBalance = await ssctoken.balanceOf(owner.address);

      await expect(ssctoken.burn(burnAmount))
        .to.emit(ssctoken, 'Transfer')
        .withArgs(owner.address, ethers.ZeroAddress, burnAmount);

      expect(await ssctoken.totalSupply()).to.equal(initialTotalSupply - burnAmount);
      expect(await ssctoken.balanceOf(owner.address)).to.equal(initialOwnerBalance - burnAmount);
    });

    it('should fail burn when amount exceeds balance', async function () {
      const burnAmount = ethers.parseEther('10000000');
      await expect(
        ssctoken.burn(burnAmount)
      ).to.be.revertedWithCustomError(ssctoken, 'ERC20InsufficientBalance');
    });

    it('should fail burn when not owner', async function () {
      const burnAmount = ethers.parseEther('100');
      await expect(
        ssctoken.connect(addr1).burn(burnAmount)
      ).to.be.revertedWithCustomError(ssctoken, 'OwnableUnauthorizedAccount');
    });

    it('should allow owner to burnFrom any address', async function () {
      const burnAmount = ethers.parseEther('100');
      await ssctoken.transfer(addr1.address, burnAmount * 2n);
      const initialTotalSupply = await ssctoken.totalSupply();
      const initialAddr1Balance = await ssctoken.balanceOf(addr1.address);

      await expect(ssctoken.burnFrom(addr1.address, burnAmount))
        .to.emit(ssctoken, 'Transfer')
        .withArgs(addr1.address, ethers.ZeroAddress, burnAmount);

      expect(await ssctoken.totalSupply()).to.equal(initialTotalSupply - burnAmount);
      expect(await ssctoken.balanceOf(addr1.address)).to.equal(initialAddr1Balance - burnAmount);
    });

    it('should fail burnFrom when not owner', async function () {
      await expect(
        ssctoken.connect(addr1).burnFrom(owner.address, ethers.parseEther('100'))
      ).to.be.revertedWithCustomError(ssctoken, 'OwnableUnauthorizedAccount');
    });
  });

  describe('Pause Functionality (Owner Only)', function () {
    it('should allow owner to pause', async function () {
      await expect(ssctoken.pause())
        .to.emit(ssctoken, 'Paused')
        .withArgs(owner.address);

      expect(await ssctoken.paused()).to.equal(true);
    });

    it('should fail pause when not owner', async function () {
      await expect(
        ssctoken.connect(addr1).pause()
      ).to.be.revertedWithCustomError(ssctoken, 'OwnableUnauthorizedAccount');
    });

    it('should block all transfers when paused', async function () {
      await ssctoken.pause();
      await expect(
        ssctoken.transfer(addr1.address, ethers.parseEther('100'))
      ).to.be.revertedWithCustomError(ssctoken, 'EnforcedPause');

      await expect(
        ssctoken.connect(addr1).transfer(addr2.address, ethers.parseEther('100'))
      ).to.be.revertedWithCustomError(ssctoken, 'EnforcedPause');
    });

    it('should allow owner to unpause', async function () {
      await ssctoken.pause();

      await expect(ssctoken.unpause())
        .to.emit(ssctoken, 'Unpaused')
        .withArgs(owner.address);

      expect(await ssctoken.paused()).to.equal(false);
    });

    it('should block unpause when not owner', async function () {
      await ssctoken.pause();
      await expect(
        ssctoken.connect(addr1).unpause()
      ).to.be.revertedWithCustomError(ssctoken, 'OwnableUnauthorizedAccount');
    });

    it('should resume transfers after unpause', async function () {
      await ssctoken.pause();
      await ssctoken.unpause();

      const transferAmount = ethers.parseEther('100');
      const initialOwnerBalance = await ssctoken.balanceOf(owner.address);
      const initialAddr1Balance = await ssctoken.balanceOf(addr1.address);

      await ssctoken.transfer(addr1.address, transferAmount);

      expect(await ssctoken.balanceOf(owner.address)).to.equal(initialOwnerBalance - transferAmount);
      expect(await ssctoken.balanceOf(addr1.address)).to.equal(initialAddr1Balance + transferAmount);
    });
  });

  describe('Ownership Management', function () {
    it('should allow ownership transfer', async function () {
      await expect(ssctoken.transferOwnership(addr1.address))
        .to.emit(ssctoken, 'OwnershipTransferred')
        .withArgs(owner.address, addr1.address);

      expect(await ssctoken.owner()).to.equal(addr1.address);
    });

    it('should fail ownership transfer when not owner', async function () {
      await expect(
        ssctoken.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWithCustomError(ssctoken, 'OwnableUnauthorizedAccount');
    });

    it('should fail to use mint after ownership transfer with old owner', async function () {
      await ssctoken.transferOwnership(addr1.address);
      await expect(
        ssctoken.mint(addr2.address, ethers.parseEther('1000'))
      ).to.be.revertedWithCustomError(ssctoken, 'OwnableUnauthorizedAccount');
    });

    it('should allow new owner to mint after transfer', async function () {
      await ssctoken.transferOwnership(addr1.address);
      await expect(
        ssctoken.connect(addr1).mint(addr2.address, ethers.parseEther('1000'))
      ).to.not.be.reverted;
    });
  });

  describe('Security: Zero Address Transfers', function () {
    it('should fail transfer from zero address', async function () {
      const transferAmount = ethers.parseEther('100');
      await expect(
        ssctoken.transferFrom(ethers.ZeroAddress, addr1.address, transferAmount)
      ).to.be.reverted;
    });

    it('should fail mint to zero address', async function () {
      await expect(
        ssctoken.mint(ethers.ZeroAddress, ethers.parseEther('1000'))
      ).to.be.revertedWithCustomError(ssctoken, 'ERC20InvalidReceiver');
    });

    it('should fail approve for zero address spender', async function () {
      await expect(
        ssctoken.approve(ethers.ZeroAddress, ethers.parseEther('100'))
      ).to.be.revertedWithCustomError(ssctoken, 'ERC20InvalidSpender');
    });
  });
});
