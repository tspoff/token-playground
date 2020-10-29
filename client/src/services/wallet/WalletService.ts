import { Keypering } from "./Keypering";
import { Synapse } from "./Synapse";
import { Wallet } from "./Wallet";

export enum Wallets {
  KEYPERING = "KEYPERING",
  SYNAPSE = "SYNAPSE",
}

export class WalletService {
  /**
   * Manages connection logic for each supported wallet
   * @remarks Instantiated as a singleton instance for use in connecting to wallets
   */
  async connect(walletType: Wallets, params): Promise<Wallet> {
    console.log("connectWallet ", walletType, params);
    switch (walletType) {
      case Wallets.KEYPERING:
        console.log(`Connect to Keypering..`);
        const keypering = new Keypering(params.walletUri);
        const token = await keypering.requestAuth(
          "Token Playground - Connection Request"
        );
        await keypering.setToken(token);
        return keypering;
      case Wallets.SYNAPSE:
        console.log(`Connect to Synapse..`);
        const synapse = new Synapse();
        await synapse.connect(params.walletUri, params.injectedCkb);
        return synapse;
      default:
        throw new Error(`Invalid wallet type specified ${walletType}`);
    }
  }
}

export const walletService = new WalletService();
