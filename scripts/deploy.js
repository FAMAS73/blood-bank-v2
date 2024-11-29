const hre = require("hardhat");

async function main() {
  // Deploy the BloodDonation contract
  const BloodDonation = await hre.ethers.getContractFactory("BloodDonation");
  const bloodDonation = await BloodDonation.deploy();

  await bloodDonation.waitForDeployment();

  const address = await bloodDonation.getAddress();
  console.log("BloodDonation contract deployed to:", address);

  // Update the .env file with the contract address
  const fs = require('fs');
  const envFile = '.env';
  const envContent = fs.readFileSync(envFile, 'utf-8');
  const updatedContent = envContent.replace(
    /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`
  );
  fs.writeFileSync(envFile, updatedContent);
  console.log("Updated .env file with contract address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
