'use client';

import { useEffect, useState, useCallback } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as WalletAdapterNetwork;
// Use a public RPC endpoint for development
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

const DashboardFeature = () => {
    const { publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState(0);
    const [betAmount, setBetAmount] = useState(1); // Default bet amount to 1

    useEffect(() => {
        if (publicKey) {
            console.log('Public Key:', publicKey.toString()); // Debugging line
            const fetchBalance = async () => {
                try {
                    const balance = await connection.getBalance(publicKey);
                    console.log('Fetched balance (lamports):', balance);
                    setBalance(balance / 1e9); // Convert lamports to SOL
                    console.log('Balance (SOL):', balance / 1e9);
                } catch (error) {
                    console.error('Error fetching balance:', error);
                }
            };

            fetchBalance();
        }
    }, [publicKey]);

    const handlePlaceBet = useCallback(async () => {
        if (!publicKey) {
            alert('Please connect your wallet');
            return;
        }

        if (betAmount > balance) {
            alert('Insufficient balance to place this bet.');
            return;
        }

        try {
            // Assuming the recipient's public key is the same as the connected wallet's public key
            const recipientPublicKey = publicKey; // Use the connected wallet's public key

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: betAmount * 1e9, // Convert SOL to lamports
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'processed');

            // Deduct the bet amount from the balance
            setBalance(balance - betAmount);
            console.log('Placing bet of:', betAmount);
        } catch (error) {
            console.error('Error placing bet:', error);
        }
    }, [publicKey, betAmount, balance, sendTransaction]);

    const handleCashOut = useCallback(async () => {
        if (!publicKey) {
            alert('Please connect your wallet');
            return;
        }

        try {
            // Implement cash out logic here
            console.log('Cashing out');
        } catch (error) {
            console.error('Error cashing out:', error);
        }
    }, [publicKey]);

    return (
        <div className="flex flex-col items-center justify-center min-w-screen min-h-screen py-4 bg-black-100">
            <h1 className="text-2xl font-bold mb-4 text-center">Sell your Sol for FreeDUMBS and gamble on the machine in Mortal Kombat.</h1>
            <div className="flex flex-col items-center justify-center w-full max-w-6xl mt-4">
                <iframe
                    src="http://localhost"
                    width="100%"
                    height="500px"
                    style={{ border: 'none' }}
                    title="Emulator"
                ></iframe>
                <div className="border p-4 rounded-lg shadow-md bg-gray-50 w-1/2 mt-4">
                    <button
                        className="bg-green-500 text-white px-4 py-2 mb-2 w-full rounded hover:bg-green-600"
                        onClick={handlePlaceBet}
                    >
                        Place Bet
                    </button>
                    <input
                        type="range"
                        min="1"
                        max={balance}
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        className="w-full mb-2"
                    />
                    <span className="block text-center mb-2">Bet Amount: {betAmount} DUMBS</span>
                    <button
                        className="bg-red-500 text-white px-4 py-2 mt-2 w-full rounded hover:bg-red-600"
                        onClick={handleCashOut}
                    >
                        Cash Out
                    </button>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);

    const wallets = [
        new PhantomWalletAdapter(),
    ];

    return (
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                <DashboardFeature />
            </WalletModalProvider>
        </WalletProvider>
    );
};

export default App;