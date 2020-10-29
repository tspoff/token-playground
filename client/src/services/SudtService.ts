import { Cell, HexString, Hash, Address, Script } from "@ckb-lumos/base";
import { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { Api } from "./Api";
import { getConfig } from "../config/lumosConfig";
import { ckbHash } from "../utils/ckbUtils";
import { computeScriptHash } from "../utils/scriptUtils";

export interface IssueSudtParams {
  sender: Address;
  amount: BigInt;
  txFee: BigInt;
}

export interface TransferSudtParams {
  udtHash: Hash;
  sender: Address;
  recipient: Address;
  amount: BigInt;
  txFee: BigInt;
}

export interface TransferSudt {
  params: TransferSudtParams;
  description: string;
  txSkeleton: TransactionSkeletonType;
}

export interface IssueSudt {
  params: IssueSudtParams;
  description: string;
  txSkeleton: TransactionSkeletonType;
}

export interface FetchUdtBalanceParams {
  lockScript: Script;
  sudtArgs: Hash;
}

export function sudtArgsToTypeHash(args: Hash): Hash {
  const sudtConfig = getConfig().SCRIPTS["SUDT"];
  if (!sudtConfig) throw new Error(`No config for SUDT found`);

  const type: Script = {
    args: args,
    code_hash: sudtConfig.CODE_HASH,
    hash_type: sudtConfig.HASH_TYPE,
  };

  return computeScriptHash(type);
}

class SudtService {
  /**
   * Wrapper class for sudt related routes on token-playground server instance
   * @remarks Instantiated as a singleton using the env-specified REACT_APP_DAPP_SERVER_URI URL
   */
  
  dappServerUri: string;
  constructor(dappServerUri) {
    this.dappServerUri = dappServerUri;
  }

  async fetchUdtBalance(params: FetchUdtBalanceParams): Promise<BigInt> {
    const { lockScript, sudtArgs } = params;
    const response = await Api.post(this.dappServerUri, "/sudt/get-balance", {
      sudtArgs,
      lockScript,
    });

    return BigInt(response.payload.balance);
  }

  async buildTransferSudt(params: TransferSudtParams): Promise<TransferSudt> {
    const response = await Api.post(
      this.dappServerUri,
      "/sudt/build-transfer",
      {
        udtHash: params.udtHash,
        sender: params.sender,
        recipient: params.recipient,
        amount: params.amount.toString(),
        txFee: params.txFee.toString(),
      }
    );

    const data = response.payload;
    return data;
  }

  async transferSudt(
    params: TransferSudtParams,
    signatures: HexString[]
  ): Promise<Hash> {
    const response = await Api.post(this.dappServerUri, "/sudt/transfer", {
      params,
      signatures,
    });

    return response.payload.txHash as Hash;
  }

  async buildIssueSudt(params: IssueSudtParams): Promise<IssueSudt> {
    const response = await Api.post(
      this.dappServerUri,
      "/sudt/build-issue-sudt",
      {
        sender: params.sender,
        amount: params.amount.toString(),
        txFee: params.txFee.toString(),
      }
    );

    const data = response.payload;
    return data;
  }

  async issueSudt(
    params: IssueSudtParams,
    signatures: HexString[]
  ): Promise<Hash> {
    const response = await Api.post(this.dappServerUri, "/sudt/issue-sudt", {
      params: {
        sender: params.sender,
        amount: params.amount.toString(),
        txFee: params.txFee.toString(),
      },
      signatures,
    });
    return response.payload.txHash as Hash;
  }
}

export const sudtService = new SudtService(
  process.env.REACT_APP_DAPP_SERVER_URI
);
