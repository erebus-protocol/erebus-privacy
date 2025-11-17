import axios, { AxiosInstance } from 'axios';
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';

export interface ErebusConfig {
  apiUrl: string;
  solanaRpcUrl?: string;
}

export interface TransferPrepareRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
}

export interface TransferPrepareResponse {
  transferId: string;
  amount: number;
  feeAmount: number;
  totalToPay: number;
  treasuryAddress: string;
  breakdown: {
    transferAmount: number;
    privacyFee: number;
    estimatedNetworkFee: number;
    total: number;
  };
}

export interface TransferExecuteRequest {
  transferId: string;
  paymentSignature: string;
  fromAddress: string;
}

export interface TransferExecuteResponse {
  success: boolean;
  transferId: string;
  paymentSignature: string;
  destinationSignature: string;
  amount: number;
  destination: string;
  paymentExplorer: string;
  destinationExplorer: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

export interface SwapQuoteRequest {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
}

export class ErebusClient {
  private api: AxiosInstance;
  private connection?: Connection;

  constructor(config: ErebusConfig) {
    this.api = axios.create({
      baseURL: `${config.apiUrl}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (config.solanaRpcUrl) {
      this.connection = new Connection(config.solanaRpcUrl, 'confirmed');
    }
  }

  /**
   * Privacy Transfer API
   */
  public transfer = {
    /**
     * Prepare SOL transfer - Step 1
     * Calculate fees and get payment details
     */
    prepareSol: async (request: TransferPrepareRequest): Promise<TransferPrepareResponse> => {
      const response = await this.api.post('/transfer/sol/prepare', {
        from_address: request.fromAddress,
        to_address: request.toAddress,
        amount: request.amount,
      });
      return {
        transferId: response.data.transfer_id,
        amount: response.data.amount,
        feeAmount: response.data.fee_amount,
        totalToPay: response.data.total_to_pay,
        treasuryAddress: response.data.treasury_address,
        breakdown: {
          transferAmount: response.data.breakdown.transfer_amount,
          privacyFee: response.data.breakdown.privacy_fee,
          estimatedNetworkFee: response.data.breakdown.estimated_network_fee,
          total: response.data.breakdown.total,
        },
      };
    },

    /**
     * Execute SOL transfer - Step 2
     * After user pays to treasury, backend forwards to destination
     */
    executeSol: async (request: TransferExecuteRequest): Promise<TransferExecuteResponse> => {
      const response = await this.api.post('/transfer/sol/execute', {
        transfer_id: request.transferId,
        payment_signature: request.paymentSignature,
        from_address: request.fromAddress,
      });
      return {
        success: response.data.success,
        transferId: response.data.transfer_id,
        paymentSignature: response.data.payment_signature,
        destinationSignature: response.data.destination_signature,
        amount: response.data.amount,
        destination: response.data.destination,
        paymentExplorer: response.data.payment_explorer,
        destinationExplorer: response.data.destination_explorer,
      };
    },

    /**
     * Prepare Token transfer - Step 1
     */
    prepareToken: async (request: {
      fromAddress: string;
      toAddress: string;
      tokenMint: string;
      amount: number;
      decimals: number;
    }) => {
      const response = await this.api.post('/transfer/token/prepare', {
        from_address: request.fromAddress,
        to_address: request.toAddress,
        token_mint: request.tokenMint,
        amount: request.amount,
        decimals: request.decimals,
      });
      return response.data;
    },

    /**
     * Execute Token transfer - Step 2
     */
    executeToken: async (request: TransferExecuteRequest) => {
      const response = await this.api.post('/transfer/token/execute', {
        transfer_id: request.transferId,
        payment_signature: request.paymentSignature,
        from_address: request.fromAddress,
      });
      return response.data;
    },
  };

  /**
   * Token Metadata API
   */
  public tokens = {
    /**
     * Get popular token list
     */
    getList: async (): Promise<TokenInfo[]> => {
      const response = await this.api.get('/token-list');
      return response.data;
    },

    /**
     * Get token info by mint address
     */
    getInfo: async (mint: string): Promise<TokenInfo> => {
      const response = await this.api.get(`/token-info/${mint}`);
      return response.data;
    },

    /**
     * Get token metadata from CryptoAPIs (fallback)
     */
    getMetadata: async (mint: string, network: 'mainnet' | 'devnet' = 'mainnet') => {
      const response = await this.api.get(`/token-metadata/cryptoapis/${mint}?network=${network}`);
      return response.data;
    },

    /**
     * Get all tokens in wallet
     */
    getWalletTokens: async (address: string) => {
      const response = await this.api.get(`/wallet-tokens/${address}`);
      return response.data;
    },
  };

  /**
   * Swap API (Jupiter integration)
   */
  public swap = {
    /**
     * Get swap quote
     */
    getQuote: async (request: SwapQuoteRequest) => {
      const response = await this.api.post('/swap/quote', {
        input_mint: request.inputMint,
        output_mint: request.outputMint,
        amount: request.amount,
        slippage_bps: request.slippageBps || 50,
      });
      return response.data;
    },
  };

  /**
   * Balance API
   */
  public balance = {
    /**
     * Get SOL balance
     */
    getSol: async (address: string): Promise<number> => {
      const response = await this.api.get(`/balance/${address}`);
      return response.data.balance;
    },

    /**
     * Get token balance
     */
    getToken: async (wallet: string, mint: string) => {
      const response = await this.api.get(`/token-balance/${wallet}/${mint}`);
      return response.data;
    },
  };

  /**
   * Transaction History API
   */
  public transactions = {
    /**
     * Get transaction history for address
     */
    getHistory: async (address: string, limit: number = 50) => {
      const response = await this.api.get(`/transactions/${address}?limit=${limit}`);
      return response.data.transactions;
    },
  };

  /**
   * Treasury API
   */
  public treasury = {
    /**
     * Get treasury wallet address
     */
    getAddress: async (): Promise<string> => {
      const response = await this.api.get('/treasury/address');
      return response.data.address;
    },
  };
}

export default ErebusClient;
