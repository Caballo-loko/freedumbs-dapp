import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenMint } from '../target/types/token_mint';

describe('token_mint', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenMint as Program<TokenMint>;

  let mainAccount = Keypair.generate();
  let depositor = provider.wallet.publicKey;
  let dumbsMint = null;
  let depositorDumbsAccount = null;

  it('Initializes the DUMBS mint', async () => {
    // Create the DUMBS mint
    dumbsMint = await Token.createMint(
      provider.connection,
      mainAccount,
      mainAccount.publicKey,
      null,
      9,
      TOKEN_PROGRAM_ID
    );

    await program.methods.initialize().accounts({
      mainAccount: mainAccount.publicKey,
      dumbsMint: dumbsMint.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    }).signers([mainAccount]).rpc();
  });

  it('Deposits SOL and mints DUMBS', async () => {
    // Create the depositor's DUMBS token account
    depositorDumbsAccount = await dumbsMint.createAccount(depositor);

    // Deposit 1 SOL and mint 100 DUMBS
    await program.methods.depositSol(new anchor.BN(1 * LAMPORTS_PER_SOL)).accounts({
      depositor: depositor,
      mainAccount: mainAccount.publicKey,
      dumbsMint: dumbsMint.publicKey,
      depositorDumbsAccount: depositorDumbsAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    }).rpc();

    // Check the balance of the depositor's DUMBS token account
    const balance = await dumbsMint.getAccountInfo(depositorDumbsAccount);
    console.log('Depositor DUMBS balance:', balance.amount.toNumber());
  });
});