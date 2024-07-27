// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import TokenMintIDL from '../target/idl/token_mint.json';
import type { TokenMint } from '../target/types/token_mint';

// Re-export the generated IDL and type
export { TokenMint, TokenMintIDL };

// The programId is imported from the program IDL.
export const TOKEN_MINT_PROGRAM_ID = new PublicKey(TokenMintIDL.address);

// This is a helper function to get the TokenMint Anchor program.
export function getTokenMintProgram(provider: AnchorProvider) {
  return new Program(TokenMintIDL as TokenMint, provider);
}

// This is a helper function to get the program ID for the TokenMint program depending on the cluster.
export function getTokenMintProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the TokenMint program on devnet and testnet.
      return new PublicKey('YourDevnetOrTestnetProgramID');
    case 'mainnet-beta':
    default:
      return TOKEN_MINT_PROGRAM_ID;
  }
}