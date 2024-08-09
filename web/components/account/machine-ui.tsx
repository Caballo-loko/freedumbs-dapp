"use client";

import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { actions, programs } from '@metaplex/js';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const { mintNFT } = actions;
const { metadata: { Metadata } } = programs;

const MachineUI: React.FC<{ programId: string }> = ({ programId }) => {
  const { publicKey, signTransaction } = useWallet();
  const [newAgent, setNewAgent] = useState('');
  const [agents, setAgents] = useState<{ id: string; name: string; winRate: number; progression: number[] }[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      // Fetch the list of registered agents from your backend or Solana program
      const agentsData = [
        { id: '1', name: 'Agent 1', winRate: 75, progression: [10, 20, 30, 40, 50] },
        { id: '2', name: 'Agent 2', winRate: 60, progression: [15, 25, 35, 45, 55] },
        { id: '3', name: 'Agent 3', winRate: 85, progression: [20, 30, 40, 50, 60] },
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
          programId: new PublicKey(programId),
        })
      );

      if (!signTransaction) {
        alert('Transaction signing is not available');
        return;
      }
      const signature = await signTransaction(transaction);
      await connection.confirmTransaction(signature, 'processed');

      // Mint NFT using Metaplex
      await mintNFT({
        connection,
        wallet: { publicKey, signTransaction },
        uri: 'https://example.com/nft-metadata.json', // Replace with your metadata URI
        maxSupply: 1,
      });

      setNewAgent('');
      setAgents((prevAgents) => [...prevAgents, { id: newAgent, name: newAgent, winRate: Math.floor(Math.random() * 100), progression: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)) }]);
    } catch (error) {
      console.error('Error registering agent:', error);
    }
  };

  const winRateData = {
    labels: agents.map(agent => agent.name),
    datasets: [
      {
        label: 'Win Rate (%)',
        data: agents.map(agent => agent.winRate),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const progressionData = (agent) => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: `${agent.name} Progression`,
        data: agent.progression,
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  });

  return (
    <div className="container">
      <h1>AI Agent Registry Dashboard</h1>
      <input
        type="text"
        value={newAgent}
        onChange={(e) => setNewAgent(e.target.value)}
        placeholder="Upload Machine"
      />
      <button onClick={handleRegisterAgent}>Register Agent</button>
      <h2>Registered Agents</h2>
      <ul>
        {agents.map((agent) => (
          <li key={agent.id}>{agent.name}</li>
        ))}
      </ul>
      <div className="charts-container">
        <div className="chart">
          <h2>Win Rates</h2>
          <Bar data={winRateData} />
        </div>
        <div className="chart">
          <h2>Progression</h2>
          <div className="agent-charts">
            {agents.map((agent) => (
              <div key={agent.id} className="agent-chart">
                <h3>{agent.name}</h3>
                <Line data={progressionData(agent)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineUI;

<style jsx>{`
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .charts-container {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
  .chart {
    flex: 1;
    margin: 10px;
  }
  .agent-charts {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
  .agent-chart {
    flex: 1;
    margin: 10px;
  }
  input, button {
    margin: 10px 0;
  }
`}</style>