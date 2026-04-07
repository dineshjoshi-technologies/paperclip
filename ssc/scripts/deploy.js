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
  console.log("Implement at:", await upgrades.erc1967.getImplementationAddress(address));

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    proxy: address,
    implementation: await upgrades.erc1967.getImplementationAddress(address),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    `deployment-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
