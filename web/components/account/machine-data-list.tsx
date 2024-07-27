"use client";

import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { actions, programs } from '@metaplex/js';

const { mintNFT } = actions;
const { metadata: { Metadata } } = programs;

const MachineDataList = () => {
  const { publicKey, sendTransaction } = useWallet();
  const [newAgent, setNewAgent] = useState('');
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchAgents = async () => {
      // Fetch the list of registered agents from your backend or Solana program
      const agentsData = [
        { id: '1', name: 'Agent 1' },
        { id: '2', name: 'Agent 2' },
      ];
      setAgents(agentsData);
    };

    fetchAgents();
  }, []);

  const handleRegisterAgent = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: new PublicKey(newAgent),
          lamports: await connection.getMinimumBalanceForRentExemption(0),
          space: 0,
          programId: new PublicKey('FHXBTEpXesmHEdiEAFTiMbsfMBJHf1BCxGw5kZHWLHiv'),
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'processed');

      // Mint NFT using Metaplex
      await mintNFT({
        connection,
        wallet: { publicKey, sendTransaction },
        uri: 'https://example.com/nft-metadata.json', // Replace with your metadata URI
        maxSupply: 1,
      });

      setNewAgent('');
      setAgents((prevAgents) => [...prevAgents, { id: newAgent, name: newAgent }]);
    } catch (error) {
      console.error('Error registering agent:', error);
    }
  };

  return (
    <div>
      <h1>AI Agent Registry</h1>
      <input
        type="text"
        value={newAgent}
        onChange={(e) => setNewAgent(e.target.value)}
        placeholder="Enter new agent address"
      />
      <button onClick={handleRegisterAgent}>Register Agent</button>
      <h2>Registered Agents</h2>
      <ul>
        {agents.map((agent) => (
          <li key={agent.id}>{agent.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MachineDataList;