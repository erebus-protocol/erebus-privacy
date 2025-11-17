/**
 * Erebus SDK - JavaScript Example
 * 
 * This example demonstrates how to use the Erebus SDK to perform
 * private SOL transfers with zero-knowledge privacy
 */

const { ErebusClient } = require('erebus-sdk');
const { Connection, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');

// Initialize client
const client = new ErebusClient({
  apiUrl: 'http://localhost:8001',
  solanaRpcUrl: 'https://api.mainnet-beta.solana.com'
});

/**
 * Example 1: Private SOL Transfer
 */
async function privateSolTransfer() {
  try {
    console.log('\n=== Private SOL Transfer ===\n');

    // Step 1: Prepare transfer and get fee breakdown
    console.log('Step 1: Preparing transfer...');
    const prepareResult = await client.transfer.prepareSol({
      fromAddress: 'YourWalletAddress',
      toAddress: 'DestinationWalletAddress',
      amount: 0.5 // 0.5 SOL
    });

    console.log('Transfer ID:', prepareResult.transferId);
    console.log('Fee Breakdown:');
    console.log('  - Transfer Amount:', prepareResult.amount, 'SOL');
    console.log('  - Privacy Fee:', prepareResult.feeAmount, 'SOL');
    console.log('  - Total to Pay:', prepareResult.totalToPay, 'SOL');
    console.log('  - Treasury Address:', prepareResult.treasuryAddress);

    // Step 2: User pays to treasury (using wallet)
    // In a real app, this would be done via wallet adapter
    console.log('\nStep 2: Please pay', prepareResult.totalToPay, 'SOL to treasury');
    console.log('Treasury:', prepareResult.treasuryAddress);
    
    // Simulate payment transaction
    const paymentSignature = 'your_payment_signature_here';

    // Step 3: Execute transfer (backend forwards to destination)
    console.log('\nStep 3: Executing transfer...');
    const executeResult = await client.transfer.executeSol({
      transferId: prepareResult.transferId,
      paymentSignature: paymentSignature,
      fromAddress: 'YourWalletAddress'
    });

    console.log('\n✅ Transfer Complete!');
    console.log('Payment TX:', executeResult.paymentExplorer);
    console.log('Destination TX:', executeResult.destinationExplorer);

  } catch (error) {
    console.error('Transfer failed:', error.message);
  }
}

/**
 * Example 2: Get Token Information
 */
async function getTokenInfo() {
  try {
    console.log('\n=== Token Information ===\n');

    // Get popular token list
    const tokens = await client.tokens.getList();
    console.log(`Found ${tokens.length} popular tokens`);
    console.log('Top 5 tokens:', tokens.slice(0, 5).map(t => t.symbol));

    // Get specific token info
    const solMint = 'So11111111111111111111111111111111111111112';
    const tokenInfo = await client.tokens.getInfo(solMint);
    console.log('\nSOL Token Info:');
    console.log('  - Symbol:', tokenInfo.symbol);
    console.log('  - Name:', tokenInfo.name);
    console.log('  - Decimals:', tokenInfo.decimals);

  } catch (error) {
    console.error('Failed to get token info:', error.message);
  }
}

/**
 * Example 3: Get Wallet Balance
 */
async function getBalance() {
  try {
    console.log('\n=== Wallet Balance ===\n');

    const address = 'YourWalletAddress';
    
    // Get SOL balance
    const solBalance = await client.balance.getSol(address);
    console.log('SOL Balance:', solBalance, 'SOL');

    // Get all tokens in wallet
    const walletTokens = await client.tokens.getWalletTokens(address);
    console.log('\nTokens in wallet:', walletTokens.tokens.length);

  } catch (error) {
    console.error('Failed to get balance:', error.message);
  }
}

/**
 * Example 4: Get Swap Quote
 */
async function getSwapQuote() {
  try {
    console.log('\n=== Swap Quote ===\n');

    const quote = await client.swap.getQuote({
      inputMint: 'So11111111111111111111111111111111111111112', // SOL
      outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      amount: 1000000000, // 1 SOL in lamports
      slippageBps: 50 // 0.5% slippage
    });

    console.log('Swap 1 SOL for USDC');
    console.log('  - Input:', quote.inputAmount);
    console.log('  - Output:', quote.outputAmount);
    console.log('  - Price Impact:', quote.priceImpactPct, '%');

  } catch (error) {
    console.error('Failed to get swap quote:', error.message);
  }
}

/**
 * Example 5: Get Transaction History
 */
async function getTransactionHistory() {
  try {
    console.log('\n=== Transaction History ===\n');

    const address = 'YourWalletAddress';
    const transactions = await client.transactions.getHistory(address, 10);

    console.log(`Last ${transactions.length} transactions:`);
    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.tx_type} - ${tx.amount} ${tx.token}`);
      console.log(`   Status: ${tx.status} - ${tx.timestamp}`);
    });

  } catch (error) {
    console.error('Failed to get transaction history:', error.message);
  }
}

// Run examples
(async () => {
  console.log('🔒 Erebus Protocol SDK - JavaScript Examples\n');
  console.log('============================================');

  // Uncomment the example you want to run
  // await privateSolTransfer();
  // await getTokenInfo();
  // await getBalance();
  // await getSwapQuote();
  // await getTransactionHistory();

  console.log('\n✅ Examples completed!');
})();
