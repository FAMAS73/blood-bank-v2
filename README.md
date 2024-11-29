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

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Deploy the smart contract:
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

6. Start the development server:
```bash
npm run dev
```

## Smart Contract

The `BloodDonation.sol` contract handles:
- Donor registration
- Blood donation tracking
- Blood request management
- Inventory management
- Automated matching

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
