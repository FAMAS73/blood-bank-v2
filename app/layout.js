import './globals.css';
import { Inter } from 'next/font/google';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Blood Bank DApp',
  description: 'Decentralized Blood Bank Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0 }}>
        <Providers>
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              {children}
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
