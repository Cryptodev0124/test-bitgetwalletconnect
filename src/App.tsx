import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { createWeb3Modal } from "@web3modal/wagmi/react";

import { http, createConfig, WagmiProvider } from "wagmi";
import { mainnet, arbitrum } from "viem/chains";
import { walletConnect, injected } from "wagmi/connectors";
import type { CreateConnectorFn } from "@wagmi/core";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authConnector } from "@web3modal/wagmi";
import { isTelegramEnvironment, overrideWindowOpen } from "@bitget-wallet/omni-connect";

import "./styles.css";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '4807d388fe495226b7fc14743af2e1d9';
if (!projectId) throw new Error("Project ID is undefined");

// 2. Create wagmiConfig
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Define chains
const chains = [mainnet, arbitrum] as const;

// create the connectors
const connectors: CreateConnectorFn[] = [];
connectors.push(walletConnect({ projectId, metadata, showQrModal: false }));
connectors.push(injected({ shimDisconnect: true }));

connectors.push(
  authConnector({
    options: { projectId },
    socials: ["google", "x", "github", "discord", "apple"], // this will create a non-custodial wallet (please check https://secure.walletconnect.com/dashboard for more info)
    showWallets: true,
    email: true,
    walletFeatures: false,
  })
);

const wagmiConfig = createConfig({
  chains, // Use the defined chains here
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  },
  connectors: connectors,
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  featuredWalletIds: [
    "38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662", // Bitget Wallet project ID
    "21c3a371f72f0057186082edb2ddd43566f7e908508ac3e85373c6d1966ed614", // Bitget Wallet Lite project ID
  ],

});

const App = () => {
  useEffect(() => {
    const initOverrideWindowOpen = async () => {
        // Check if the environment is a Telegram Mini App
        const isTMA = await isTelegramEnvironment();
        if (!isTMA) {
          return;
        }
        // Execute the initialization method from @bitget-wallet/omni-connect
        overrideWindowOpen();
    };
    initOverrideWindowOpen();
  }, []);

  return (
    <React.StrictMode>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <div className="centered-div">
            <w3m-button />
          </div>
        </QueryClientProvider>
      </WagmiProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);

export default App;