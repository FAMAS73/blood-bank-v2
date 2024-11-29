# Decentralized Blood Bank Management System

[Previous sections remain the same until Blockchain Implementation Details...]

## Blockchain Implementation Details

### Smart Contract Architecture

[Previous Smart Contract Architecture section remains the same...]

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
   - Loading state management
   - Transaction progress tracking
   - Responsive feedback

[Previous sections about Getting Started, Contributing, and License remain the same...]
