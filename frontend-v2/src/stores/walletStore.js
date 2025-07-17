import { create } from 'zustand'
import { ethers } from 'ethers'
import { LOTTERY_CONFIG } from '../constants'

const useWalletStore = create((set, get) => ({
  // State
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  balance: null,
  isConnecting: false,
  error: null,

  // Actions
  connect: async () => {
    set({ isConnecting: true, error: null })
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)

      set({
        isConnected: true,
        address,
        provider,
        signer,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        isConnecting: false,
        error: null
      })

      // Switch to correct network if needed
      const targetChainId = LOTTERY_CONFIG.POLYGON_AMOY.chainId
      if (Number(network.chainId) !== targetChainId) {
        await get().switchNetwork(targetChainId)
      }

    } catch (error) {
      set({ 
        isConnecting: false, 
        error: error.message || 'Failed to connect wallet' 
      })
      throw error
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      balance: null,
      error: null
    })
  },

  switchNetwork: async (chainId) => {
    try {
      const chainIdHex = `0x${chainId.toString(16)}`
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        })
      } catch (switchError) {
        // Network doesn't exist, add it
        if (switchError.code === 4902) {
          const config = LOTTERY_CONFIG.POLYGON_AMOY
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: config.name,
              nativeCurrency: config.nativeCurrency,
              rpcUrls: [config.rpcUrl],
              blockExplorerUrls: [config.blockExplorer],
            }],
          })
        } else {
          throw switchError
        }
      }
      
      // Update store after network switch
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()
      set({ chainId: Number(network.chainId) })
      
    } catch (error) {
      set({ error: error.message || 'Failed to switch network' })
      throw error
    }
  },

  updateBalance: async () => {
    const { provider, address } = get()
    if (!provider || !address) return
    
    try {
      const balance = await provider.getBalance(address)
      set({ balance: ethers.formatEther(balance) })
    } catch (error) {
      console.error('Failed to update balance:', error)
    }
  },

  // Initialize wallet connection if previously connected
  initialize: async () => {
    if (!window.ethereum) return
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_accounts', [])
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        const network = await provider.getNetwork()
        const balance = await provider.getBalance(address)

        set({
          isConnected: true,
          address,
          provider,
          signer,
          chainId: Number(network.chainId),
          balance: ethers.formatEther(balance),
        })
      }
    } catch (error) {
      console.error('Failed to initialize wallet:', error)
    }
  },

  // Listen for account and network changes
  setupEventListeners: () => {
    if (!window.ethereum) return

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        get().disconnect()
      } else {
        get().initialize()
      }
    })

    window.ethereum.on('chainChanged', () => {
      get().initialize()
    })
  }
}))

export default useWalletStore