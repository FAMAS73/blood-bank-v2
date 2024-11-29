# Decentralized Blood Bank Management System

A blockchain-based blood donation management system built with Next.js, Solidity, and PostgreSQL.

## Features

- **Blockchain Integration**: Secure and transparent tracking of blood donations and requests
- **Smart Contract**: Automated matching of donors and recipients
- **User Authentication**: MetaMask wallet integration
- **Real-time Updates**: Live tracking of blood inventory
- **Database Integration**: PostgreSQL for storing metadata and supplementary information

## Tech Stack

- **Frontend**: Next.js with Material UI
- **Blockchain**: Ethereum (Solidity)
- **Smart Contract Development**: Hardhat
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Web3 with MetaMask
- **API**: Next.js API Routes

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blood-bank.git
cd blood-bank
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```
POSTGRES_URL=your_postgres_url
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

## Hardhat and MetaMask Setup

1. Install MetaMask:
   - Install the [MetaMask browser extension](https://metamask.io/download/)
   - Create a new wallet or import an existing one
   - Keep your seed phrase secure and never share it

2. Configure Hardhat Local Network:
   ```bash
   # Start Hardhat node (local blockchain)
   npx hardhat node
   ```
   This will start a local Ethereum network and provide you with test accounts and their private keys.

3. Add Hardhat Network to MetaMask:
   - Open MetaMask
   - Click the network dropdown (usually shows "Ethereum Mainnet")
   - Click "Add Network"
   - Add these details:
     - Network Name: Hardhat Local
     - New RPC URL: http://127.0.0.1:8545
     - Chain ID: 31337
     - Currency Symbol: ETH

4. Import a Test Account:
   - Copy a private key from the Hardhat node output
   - In MetaMask, click your account icon
   - Select "Import Account"
   - Paste the private key and click "Import"
   This account will have test ETH for transactions.

5. Deploy Smart Contract:
   ```bash
   # Compile the contract
   npx hardhat compile

   # Deploy to local network
   npx hardhat run scripts/deploy.js --network localhost
   ```
   Save the deployed contract address to your .env file as NEXT_PUBLIC_CONTRACT_ADDRESS

6. Start the Development Server:
   ```bash
   npm run dev
   ```

## Understanding the Blockchain Implementation

### How It Works

1. **Smart Contract (BloodDonation.sol)**:
   - Acts as the decentralized database for blood donations
   - Manages blood inventory on the blockchain
   - Handles donor and recipient matching
   - Ensures transparency and immutability of records

2. **Transaction Flow**:
   - When a donor submits blood: 
     1. MetaMask prompts for transaction approval
     2. Smart contract records the donation
     3. Updates the blood inventory
     4. Emits events for frontend updates
   
   - When someone requests blood:
     1. Contract checks availability
     2. If matched, creates a request record
     3. Updates inventory automatically
     4. Notifies relevant parties

3. **Blockchain Benefits**:
   - **Immutability**: All records are permanent and cannot be altered
   - **Transparency**: Anyone can verify the blood donation history
   - **Security**: Cryptographic security for all transactions
   - **Traceability**: Complete audit trail of all donations and requests

4. **Integration Points**:
   - Frontend connects via Web3.js/ethers.js
   - MetaMask handles transaction signing
   - Events provide real-time updates
   - PostgreSQL stores supplementary data

## Database Schema

The PostgreSQL database stores:
- User profiles
- Donation metadata
- Request information
- Inventory tracking
- Transaction history

## API Routes

- `/api/users`: User management
- `/api/donations`: Donation tracking
- `/api/requests`: Blood requests
- `/api/inventory`: Blood inventory management

## Troubleshooting

1. **MetaMask Connection Issues**:
   - Ensure you're on the correct network (Hardhat Local)
   - Reset your account if transactions are stuck
   - Make sure your test account has enough ETH

2. **Smart Contract Deployment**:
   - If deployment fails, ensure Hardhat node is running
   - Check if you have enough test ETH
   - Verify network configuration in hardhat.config.js

3. **Transaction Errors**:
   - Check MetaMask gas settings
   - Ensure contract address in .env is correct
   - Verify you're using the right account

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
