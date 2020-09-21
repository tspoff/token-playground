import { Transaction } from "../DappService";

export interface Wallet {
    getAccounts()
    signTransaction(tx: Transaction, lockHash)
}