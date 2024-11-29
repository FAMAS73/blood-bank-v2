import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from './components/Navbar';
import { Box } from '@mui/material';

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
