import { Transaction } from "../DappService";

export interface Wallet {
  /**
   * Standardized interface for wallet connections
   */
  getAccounts();
  signTransaction(tx: Transaction, lockHash);
}
