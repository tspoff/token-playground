import { Transaction } from "../DappService";
import { Account } from "../../utils/Account";
import { fromTxSkeleton, toRawWitness } from "../../utils/keyperringUtils";
import { HexString } from "@ckb-lumos/base";
import CKB from "@nervosnetwork/ckb-sdk-core";
import { Wallet } from "./Wallet";

export class Synapse implements Wallet {
  walletUri!: string;
  ckb!: CKB;
  account!: Account;

  async connect(walletUri, injectedCkb) {
    if (injectedCkb === undefined) {
      throw Error("No wallet found");
    }

    this.walletUri = walletUri;
    // http://localhost:8114
    this.ckb = injectedCkb;

    let walletInfo = await injectedCkb.getAddressInfo();
    if (walletInfo.data.type !== "Secp256k1") {
      throw Error("Only secp256k1 account available");
    }

    const utilsCKB = new CKB(this.walletUri)

    this.account = {
      pubKey: walletInfo.data.publicKey.toString(),
      lockScript: {
        hash_type: "type",
        code_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        args: `0x${utilsCKB.utils.blake160(walletInfo.data.publicKey, "hex")}`,
      },
      lockHash: walletInfo.data.lock,
      address: utilsCKB.utils.pubkeyToAddress(walletInfo.data.publicKey, {
        // @ts-ignore
        prefix: "ckt",
      }),
    };
  }

  async getAccounts(): Promise<Account[]> {
    return [this.account];
  }

  async signSynapse(ckbInjected, rawTx) {
    return await ckbInjected.sign({ tx: rawTx });
  }

  async signTransaction(tx: Transaction, lockHash): Promise<HexString[]> {
    const rawTx = fromTxSkeleton(tx.txSkeleton);
    console.log(tx.txSkeleton);

    rawTx.witnesses[0] = {
      lock: "",
      inputType: "",
      outputType: "",
    };

    console.log(rawTx);

    console.log(this.ckb)
    // @ts-ignore
    const res = await this.ckb.sign({ tx: rawTx });

    // @ts-ignore
    if (!res.success) {
      // @ts-ignore
      throw new Error(res.message);
    }
    // @ts-ignore
    console.log(res);
    // @ts-ignore
    return res.data.tx.witnesses.map((witness) =>
      toRawWitness(witness)
    ) as HexString[]; // Return string array of witnesses
  }
}
