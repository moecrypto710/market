import * as solanaWeb3 from '@solana/web3.js';

// Initialize connection to Solana network (default to devnet for testing)
let connection: solanaWeb3.Connection;

/**
 * Initialize the Solana connection
 * @param network - The Solana network to connect to ('devnet', 'testnet', or 'mainnet-beta')
 */
export function initializeSolanaConnection(network: 'devnet' | 'testnet' | 'mainnet-beta' = 'devnet') {
  // Define network URL based on the selected network
  let endpoint: string;
  
  switch (network) {
    case 'mainnet-beta':
      endpoint = 'https://api.mainnet-beta.solana.com';
      break;
    case 'testnet':
      endpoint = 'https://api.testnet.solana.com';
      break;
    case 'devnet':
    default:
      endpoint = 'https://api.devnet.solana.com';
      break;
  }
  
  // Create connection
  connection = new solanaWeb3.Connection(endpoint, 'confirmed');
  console.log(`Solana connection established to ${network}`);
  
  return connection;
}

/**
 * Get the current Solana connection
 * @returns The Solana connection, initializing to devnet if not already initialized
 */
export function getSolanaConnection(): solanaWeb3.Connection {
  if (!connection) {
    return initializeSolanaConnection();
  }
  return connection;
}

/**
 * Send a Solana payment
 * @param from - The sender's account/wallet
 * @param to - The recipient's public key
 * @param amount - The amount to send in lamports (1 SOL = 1,000,000,000 lamports)
 * @returns The transaction signature
 */
export async function sendPayment(
  from: solanaWeb3.Keypair, 
  to: solanaWeb3.PublicKey | string, 
  amount: number
): Promise<string> {
  const conn = getSolanaConnection();
  
  // Convert recipient to PublicKey if it's a string
  const recipientKey = typeof to === 'string' 
    ? new solanaWeb3.PublicKey(to) 
    : to;
  
  // Create transaction
  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: recipientKey,
      lamports: amount,
    })
  );

  // Send and confirm transaction
  const signature = await solanaWeb3.sendAndConfirmTransaction(
    conn, 
    transaction, 
    [from]
  );
  
  console.log("Transaction successful!", signature);
  return signature;
}

/**
 * Create a wallet from a private key
 * @param privateKey - The base58 encoded private key or Uint8Array
 * @returns Solana Keypair
 */
export function createWalletFromPrivateKey(privateKey: string | Uint8Array): solanaWeb3.Keypair {
  if (typeof privateKey === 'string') {
    return solanaWeb3.Keypair.fromSecretKey(
      Buffer.from(privateKey, 'base58')
    );
  }
  return solanaWeb3.Keypair.fromSecretKey(privateKey);
}

/**
 * Generate a new Solana wallet
 * @returns A newly generated keypair
 */
export function generateNewWallet(): solanaWeb3.Keypair {
  return solanaWeb3.Keypair.generate();
}

/**
 * Get SOL balance for a wallet address
 * @param address - Wallet address as string or PublicKey
 * @returns Balance in SOL (not lamports)
 */
export async function getWalletBalance(address: string | solanaWeb3.PublicKey): Promise<number> {
  const conn = getSolanaConnection();
  const pubKey = typeof address === 'string' 
    ? new solanaWeb3.PublicKey(address) 
    : address;
    
  const balance = await conn.getBalance(pubKey);
  return balance / solanaWeb3.LAMPORTS_PER_SOL; // Convert from lamports to SOL
}

/**
 * Airdrop SOL to a wallet (only works on devnet/testnet)
 * @param address - Wallet address to receive the airdrop
 * @param amount - Amount in SOL to airdrop (usually limited to 1-2 SOL per request)
 * @returns Transaction signature
 */
export async function requestAirdrop(
  address: string | solanaWeb3.PublicKey, 
  amount: number
): Promise<string> {
  const conn = getSolanaConnection();
  const pubKey = typeof address === 'string' 
    ? new solanaWeb3.PublicKey(address) 
    : address;
    
  // Convert SOL to lamports
  const lamports = amount * solanaWeb3.LAMPORTS_PER_SOL;
  
  const signature = await conn.requestAirdrop(pubKey, lamports);
  await conn.confirmTransaction(signature);
  
  return signature;
}