/**
 * Token Metadata Utilities
 * 
 * Provides a unified interface for fetching token metadata with fallback mechanisms:
 * 1. Primary: Jupiter Token List (comprehensive, fast, cached)
 * 2. Fallback: CryptoAPIs.io (via backend proxy for security)
 * 3. Final: On-chain data (basic info only)
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// In-memory cache for token metadata
const tokenMetadataCache = new Map();

// Jupiter Token List cache (loaded once per session)
let jupiterTokenListCache = null;
let jupiterTokenListLoading = false;

/**
 * Load the complete Jupiter Token List
 * This is done once and cached for the entire session
 */
async function loadJupiterTokenList() {
  if (jupiterTokenListCache) {
    return jupiterTokenListCache;
  }

  if (jupiterTokenListLoading) {
    // Wait for existing load to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (jupiterTokenListCache) {
          clearInterval(checkInterval);
          resolve(jupiterTokenListCache);
        }
      }, 100);
    });
  }

  try {
    jupiterTokenListLoading = true;
    console.log('📦 Loading Jupiter Token List...');
    
    const response = await fetch('https://token.jup.ag/all');
    const tokens = await response.json();
    
    // Convert to Map for O(1) lookup
    jupiterTokenListCache = new Map(
      tokens.map(token => [token.address, token])
    );
    
    console.log(`✅ Loaded ${jupiterTokenListCache.size} tokens from Jupiter`);
    return jupiterTokenListCache;
  } catch (error) {
    console.error('❌ Failed to load Jupiter Token List:', error);
    jupiterTokenListCache = new Map(); // Empty map to prevent repeated failures
    return jupiterTokenListCache;
  } finally {
    jupiterTokenListLoading = false;
  }
}

/**
 * Get token metadata from Jupiter Token List
 */
async function getFromJupiter(mintAddress) {
  try {
    const tokenList = await loadJupiterTokenList();
    const token = tokenList.get(mintAddress);
    
    if (token) {
      return {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        logoURI: token.logoURI || null,
        decimals: token.decimals,
        tags: token.tags || [],
        source: 'jupiter'
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Jupiter lookup failed for ${mintAddress}:`, error);
    return null;
  }
}

/**
 * Get token metadata from CryptoAPIs.io via backend proxy
 */
async function getFromCryptoAPIs(mintAddress, network = 'mainnet') {
  try {
    const response = await fetch(
      `${API}/token-metadata/cryptoapis/${mintAddress}?network=${network}`,
      { timeout: 8000 }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ CryptoAPIs metadata for ${mintAddress}:`, data.symbol);
      return {
        address: data.address,
        symbol: data.symbol,
        name: data.name,
        logoURI: data.logoURI || null,
        decimals: data.decimals,
        description: data.description,
        totalSupply: data.totalSupply,
        tags: data.tags || ['cryptoapis'],
        source: 'cryptoapis'
      };
    } else if (response.status === 404) {
      console.log(`Token ${mintAddress} not found on CryptoAPIs`);
      return null;
    } else {
      console.warn(`CryptoAPIs returned status ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error(`CryptoAPIs lookup failed for ${mintAddress}:`, error);
    return null;
  }
}

/**
 * Get basic token metadata from backend (on-chain data)
 */
async function getFromBackend(mintAddress) {
  try {
    const response = await fetch(`${API}/token-info/${mintAddress}`, { timeout: 5000 });
    
    if (response.ok) {
      const data = await response.json();
      return {
        address: data.address,
        symbol: data.symbol,
        name: data.name,
        logoURI: data.logoURI || null,
        decimals: data.decimals,
        tags: data.tags || ['custom'],
        source: 'backend'
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Backend lookup failed for ${mintAddress}:`, error);
    return null;
  }
}

/**
 * Main function: Get token metadata with fallback chain
 * 
 * Strategy: Jupiter (primary) → CryptoAPIs (fallback) → Backend (on-chain)
 * 
 * @param {string} mintAddress - Token mint address
 * @param {string} network - Solana network ('mainnet' or 'devnet')
 * @returns {Promise<object>} Token metadata object
 */
export async function getTokenMetadata(mintAddress, network = 'mainnet') {
  // Check cache first
  if (tokenMetadataCache.has(mintAddress)) {
    return tokenMetadataCache.get(mintAddress);
  }

  let tokenData = null;

  // Strategy 1: Try Jupiter Token List (primary source)
  tokenData = await getFromJupiter(mintAddress);
  if (tokenData) {
    tokenMetadataCache.set(mintAddress, tokenData);
    return tokenData;
  }

  console.log(`⚠️ Token ${mintAddress} not in Jupiter list, trying CryptoAPIs...`);

  // Strategy 2: Try CryptoAPIs (fallback)
  tokenData = await getFromCryptoAPIs(mintAddress, network);
  if (tokenData) {
    tokenMetadataCache.set(mintAddress, tokenData);
    return tokenData;
  }

  console.log(`⚠️ Token ${mintAddress} not found on CryptoAPIs, using on-chain data...`);

  // Strategy 3: Try backend (on-chain basic info)
  tokenData = await getFromBackend(mintAddress);
  if (tokenData) {
    tokenMetadataCache.set(mintAddress, tokenData);
    return tokenData;
  }

  // Final fallback: Return minimal data
  console.warn(`⚠️ No metadata found for ${mintAddress}, using minimal fallback`);
  tokenData = {
    address: mintAddress,
    symbol: mintAddress.substring(0, 4) + '...' + mintAddress.substring(mintAddress.length - 4),
    name: 'Unknown Token',
    logoURI: null,
    decimals: 9,
    tags: ['unknown'],
    source: 'fallback'
  };

  tokenMetadataCache.set(mintAddress, tokenData);
  return tokenData;
}

/**
 * Batch fetch multiple token metadata
 * More efficient than individual calls
 * 
 * @param {string[]} mintAddresses - Array of mint addresses
 * @param {string} network - Solana network
 * @returns {Promise<Map>} Map of mintAddress -> metadata
 */
export async function getTokenMetadataBatch(mintAddresses, network = 'mainnet') {
  const results = new Map();
  
  // Load Jupiter list once for all tokens
  await loadJupiterTokenList();
  
  // Process all tokens concurrently
  const promises = mintAddresses.map(async (mintAddress) => {
    const metadata = await getTokenMetadata(mintAddress, network);
    results.set(mintAddress, metadata);
  });
  
  await Promise.all(promises);
  return results;
}

/**
 * Clear the metadata cache (useful for testing or refresh)
 */
export function clearTokenMetadataCache() {
  tokenMetadataCache.clear();
  jupiterTokenListCache = null;
  console.log('🗑️ Token metadata cache cleared');
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats() {
  return {
    cachedTokens: tokenMetadataCache.size,
    jupiterTokens: jupiterTokenListCache ? jupiterTokenListCache.size : 0,
    jupiterLoaded: !!jupiterTokenListCache
  };
}
