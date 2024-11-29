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


### Frontend-Blockchain Integration

The system uses a comprehensive set of utility functions (`blockchain.js`) to manage blockchain interactions:

1. **Wallet Connection**:
   ```javascript
   export const connectWallet = async () => {
     if (!window.ethereum) {
       throw new Error('Please install MetaMask to use this application');
     }
     const accounts = await window.ethereum.request({
       method: 'eth_requestAccounts',
     });
     return accounts[0];
   };
   ```
   - Handles MetaMask integration
   - Manages wallet connection requests
   - Provides user-friendly error handling
   - Returns connected account address

2. **Transaction Management**:
   ```javascript
   export const handleTransaction = async (transaction) => {
     try {
       const tx = await transaction;
       const receipt = await tx.wait();
       return receipt;
     } catch (error) {
       if (error.code === 'ACTION_REJECTED') {
         throw new Error('Transaction rejected by user');
       }
       throw new Error('Transaction failed: ' + error.message);
     }
   };
   ```
   - Wraps contract interactions
   - Handles transaction lifecycle
   - Provides transaction receipts
   - Manages user rejections

3. **Event Listening**:
   ```javascript
   export const listenToEvents = (contract, eventName, callback) => {
     contract.on(eventName, (...args) => {
       callback(...args);
     });
     return () => {
       contract.off(eventName);
     };
   };
   ```
   - Real-time updates from blockchain
   - Event-driven UI updates
   - Cleanup functionality
   - Callback pattern for flexibility

4. **Gas Management**:
   ```javascript
   export const getGasPrice = async (provider) => {
     const gasPrice = await provider.getGasPrice();
     return ethers.formatUnits(gasPrice, 'gwei');
   };

   export const estimateGas = async (contract, method, args) => {
     const gasEstimate = await contract.estimateGas[method](...args);
     return gasEstimate.toString();
   };
   ```
   - Dynamic gas price fetching
   - Transaction cost estimation
   - Optimization opportunities
   - User cost transparency

### Data Flow Architecture

1. **Donation Flow**:
   ```
   User Interface → MetaMask → Smart Contract → Blockchain
         ↑                                           ↓
   UI Update ← Event Listener ← Event Emission ← Transaction Receipt
   ```
   - User initiates donation through UI
   - MetaMask prompts for transaction approval
   - Smart contract processes donation
   - Events trigger UI updates

2. **Request Flow**:
   ```
   Hospital Interface → MetaMask → Smart Contract → Inventory Check
         ↑                                              ↓
   Status Update ← Event Listener ← Event Emission ← Request Processing
   ```
   - Hospital submits blood request
   - Smart contract verifies availability
   - Inventory updates automatically
   - Real-time status updates

3. **Inventory Management**:
   ```
   Smart Contract State → Event Emission → Frontend Listener
         ↑                                       ↓
   Blockchain Update ← Transaction Receipt ← UI Display
   ```
   - Real-time inventory tracking
   - Automatic updates on transactions
   - Event-driven UI refresh
   - Consistent state management

### Security and Error Handling

1. **Transaction Security**:
   - MetaMask signature verification
   - Gas estimation before transactions
   - Receipt confirmation
   - Error boundary implementation

2. **Data Validation**:
   ```javascript
   export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
   ```
   - Blood type validation
   - Input sanitization
   - Address formatting
   - Quantity verification

3. **Error Management**:
   - User-friendly error messages
   - Transaction failure handling
   - Network error recovery
   - MetaMask state management

### Optimization Features

1. **Performance**:
   - Efficient event filtering
   - Batch transaction processing
   - Gas optimization
   - Caching strategies

2. **User Experience**:
   ```javascript
   export const formatAddress = (address) => {
     return `${address.slice(0, 6)}...${address.slice(-4)}`;
   };
   ```
   - Human-readable addresses
2. **Hybrid Storage Approach**:
   - Blockchain: Critical transaction data
   - PostgreSQL: Supplementary information
   - Real-time synchronization
   - Data integrity verification

3. **User Interface Integration**:
   - Real-time inventory display
   - Transaction status updates
   - Wallet connection management
   - Error handling and notifications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
