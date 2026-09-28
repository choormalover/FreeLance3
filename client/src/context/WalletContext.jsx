import { createContext, useContext, useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import axios from "axios";

const WalletContext = createContext();

// MST Blockchain testnet config (native coin: MSTC)
const MST_TESTNET = {
  // 91562037 in decimal — keep in sync with VITE_NETWORK_ID in client/.env
  chainId: "0x5752035",
  chainName: "MST Testnet",
  nativeCurrency: { name: "MSTC", symbol: "MSTC", decimals: 18 },
  rpcUrls: ["https://testnetrpc.mstblockchain.com"],
  blockExplorerUrls: ["https://mstscan.com"],
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  // Mirrors `account` so the accountsChanged listener (registered once) sees the current value
  const accountRef = useRef(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    const a = localStorage.getItem("account");
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
      setAccount(a);
      accountRef.current = a;
    }

    // Listen for BridgeKey account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          handleDisconnect();
        } else if (
          accountRef.current &&
          accountRef.current.toLowerCase() !== accounts[0].toLowerCase()
        ) {
          // User switched account while logged in — force logout and re-login
          handleDisconnect();
          alert("Account switched in BridgeKey. Please connect again.");
        }
        // Otherwise it's the initial connection handshake or the same address — ignore
      });

      window.ethereum.on("chainChanged", () => {
        // Not logged in yet means connectWallet() requested this switch itself — don't reload mid-connect
        if (accountRef.current) window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  const saveSession = (token, user, account) => {
    setToken(token);
    setUser(user);
    setAccount(account);
    accountRef.current = account;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("account", account);
  };

  const handleDisconnect = () => {
    setAccount(null);
    accountRef.current = null;
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("account");
  };

  const connectWallet = async (role) => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        alert("Please install BridgeKey!");
        return { success: false };
      }

      // Switch to MST Testnet first
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: MST_TESTNET.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [MST_TESTNET],
          });
        }
      }

      // Get currently selected account from BridgeKey
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // Get nonce
      const { data: nonceData } = await axios.get(`${API}/auth/nonce/${address}`);

      // Sign message
      const message = `Welcome to FreeLance3!\n\nPlease sign this message to verify your wallet.\n\nNonce: ${nonceData.nonce}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // Verify — pass role so backend knows which portal
      const { data } = await axios.post(`${API}/auth/verify`, {
        walletAddress: address,
        signature,
        role,
      });

      saveSession(data.token, data.user, address);
      return { success: true, user: data.user };

    } catch (error) {
      console.error("Login failed:", error);

      // Handle role mismatch specifically
      if (error.response?.status === 403) {
        const correctRole = error.response?.data?.correctRole;
        const msg = error.response?.data?.error;
        alert(`⚠️ ${msg}\n\nPlease go to the ${correctRole} portal instead.`);
        return { success: false, wrongPortal: true, correctRole };
      }

      alert("Login failed: " + (error.response?.data?.error || error.message));
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    handleDisconnect();
  };

  return (
    <WalletContext.Provider value={{
      account, token, user, loading,
      connectWallet, disconnect
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
