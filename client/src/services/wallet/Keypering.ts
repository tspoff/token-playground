import { Transaction } from "../DappService";
import { Account, parseAccounts } from "../../utils/Account";
import { fromTxSkeleton, toRawWitness } from "../../utils/keyperringUtils";
import { HexString } from "@ckb-lumos/base";
import { Wallet } from "./Wallet";

export class Keypering implements Wallet {
  walletUri: string;
  token: string | undefined;

  constructor(walletUrl) {
    this.walletUri = walletUrl;
    this.token = undefined;
  }

  async requestAuth(description): Promise<string> {
    let res = await fetch(this.walletUri, {
      method: "POST",
      body: JSON.stringify({
        id: 2,
        jsonrpc: "2.0",
        method: "auth",
        params: {
          description,
        },
      }),
    });
    res = await res.json();
    // @ts-ignore
    return res.result.token as string;
  }

  setToken(token: string) {
    this.token = token;
  }

  async getAccounts(): Promise<Account[]> {
    if (!this.token) {
      throw new Error("Wallet permission token not obtained");
    }
    try {
      let res = await fetch(this.walletUri, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          id: 3,
          jsonrpc: "2.0",
          method: "query_addresses",
        }),
      });
      res = await res.json();
      // @ts-ignore
      return parseAccounts(res.result.addresses);
    } catch (error) {
      throw new Error(error);
    }
  }

  async signTransaction(tx: Transaction, lockHash): Promise<HexString[]> {
    const rawTx = fromTxSkeleton(tx.txSkeleton);

    rawTx.witnesses[0] = {
      lock: "",
      inputType: "",
      outputType: "",
    };

    let res = await fetch(this.walletUri, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        id: 4,
        jsonrpc: "2.0",
        method: "sign_and_send_transaction",
        params: {
          tx: rawTx,
          lockHash,
          description: tx.description,
        },
      }),
    });

    res = await res.json();

    // @ts-ignore
    if (res.error) {
      // @ts-ignore
      throw new Error(res.message);
    }
    // @ts-ignore
    return res.result.tx.witnesses.map((witness) =>
      toRawWitness(witness)
    ) as HexString[]; // Return string array of witnesses
  }
}