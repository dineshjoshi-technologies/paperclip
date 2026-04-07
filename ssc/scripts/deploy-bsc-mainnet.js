const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

async function main() {
  const SSCToken = await ethers.getContractFactory("SSCToken");
  const initialSupply = ethers.parseUnits("1000000000", 18); // 1B tokens
  const [deployer] = await ethers.getSigners();

  console.log("Deploying SSCToken with proxy...");
  console.log("Deployer address:", deployer.address);

  const token = await upgrades.deployProxy(
    SSCToken,
    ["SSC Token", "SSC", initialSupply, deployer.address],
    { initializer: "initialize" }
  );

  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log("SSCToken deployed to:", address);
  const implAddress = await upgrades.erc1967.getImplementationAddress(address);
  console.log("Implementation at:", implAddress);
  console.log("\n⏳ Waiting for block confirmations before verification...");
  await token.deploymentTransaction().wait(5);
  console.log("\n🔍 Verifying source code on BSCScan...");
  try {
    await hre.run("verify:verify", {
      address: implAddress,
      constructorArguments: [],
    });
    console.log("✅ Implementation verified on BSCScan");
  } catch (e) {
    console.warn("⚠️  Verification skipped or failed:", e.message);
  }
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("✅ Proxy verified on BSCScan");
  } catch (e) {
    console.warn("⚠️  Proxy verification skipped or failed:", e.message);
  }

  const deploymentInfo = {
    network: hre.network.name,
    proxy: address,
    implementation: implAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    bscScanProxy: `https://bscscan.com/address/${address}`,
    bscScanImpl: `https://bscscan.com/address/${implAddress}`,
  };

  fs.writeFileSync("deployment-bsc.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to deployment-bsc.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
