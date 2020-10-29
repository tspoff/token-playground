import { Cell, HexString, Hash, Address, Script } from "@ckb-lumos/base";
import { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { TokenSaleCellMetadata } from "../components/token-sale/TokenSaleCellList";
import { getConfig } from "../config/lumosConfig";
import { printObj } from "../utils/print";
import {
  computeScriptHash,
  generateAddress,
  parseAddress,
} from "../utils/scriptUtils";
import { Api } from "./Api";

export interface CreateTokenSaleParams {
  sender: Script;
  supplyToMint: BigInt;
  pricePerToken: BigInt;
  txFee: BigInt;
}

export interface BuyTokenSaleParams {
  sudtArgs: Hash;
  sender: Address;
  recipient: Address;
  udtAmount: string;
  pricePerToken: string;
  txFee: string;
}

export interface CreateTokenSale {
  params: CreateTokenSaleParams;
  description: string;
  txSkeleton: TransactionSkeletonType;
}

export interface BuyTokenSale {
  params: BuyTokenSaleParams;
  description: string;
  txSkeleton: TransactionSkeletonType;
}

export interface FetchUdtBalanceParams {
  lockScript: Script;
  sudtArgs: Hash;
}

export interface TokenSaleCellData {
  cells: Cell[]
  metadata: TokenSaleCellMetadata[]
}

class TokenSaleService {
  /**
   * Wrapper class for token sale related routes on token-playground server instance
   * @remarks Instantiated as a singleton using the env-specified REACT_APP_DAPP_SERVER_URI URL
   */

  dappServerUri: string;
  constructor(dappServerUri) {
    this.dappServerUri = dappServerUri;
  }

  async fetchTokenSaleCellsByArgs(
    sudtArgs: string
  ): Promise<TokenSaleCellData> {
    const response = await Api.post(
      this.dappServerUri,
      "/sudt-sale/get-token-sale-cells",
      {
        sudtArgs,
      }
    );

    console.log("fetchTokenSaleCells", response);

    return response.payload as TokenSaleCellData;
  }

  async fetchTokenSaleCells(
    lockScript: Script
  ): Promise<TokenSaleCellData> {
    const lockHash = computeScriptHash(lockScript);
    const response = await Api.post(
      this.dappServerUri,
      "/sudt-sale/get-token-sale-cells",
      {
        sudtArgs: lockHash,
      }
    );

    console.log("fetchTokenSaleCells", response);

    return response.payload as TokenSaleCellData;
  }

  /**
   * @param params: Create token sale parameters
   */
  async buildCreateTokenSale(
    params: CreateTokenSaleParams
  ): Promise<CreateTokenSale> {
    const sudtConfig = getConfig().SCRIPTS["SUDT"];

    if (!sudtConfig) {
      throw new Error(`No config for SUDT script found`);
    }

    const lockHash = computeScriptHash(params.sender);
    const address = generateAddress(params.sender);

    const response = await Api.post(
      this.dappServerUri,
      "/sudt-sale/build-create-token-sale",
      {
        sender: address,
        sudtArgs: lockHash,
        supplyToMint: params.supplyToMint.toString(),
        pricePerToken: params.pricePerToken.toString(),
        txFee: params.txFee.toString(),
      }
    );

    printObj(response.payload, "build-create-token-sale");

    const data = response.payload;
    return data;
  }

  async createTokenSale(
    params: CreateTokenSaleParams,
    signatures: HexString[]
  ): Promise<Hash> {
    const lockHash = computeScriptHash(params.sender);
    const address = generateAddress(params.sender);

    const response = await Api.post(
      this.dappServerUri,
      "/sudt-sale/create-token-sale",
      {
        params: {
          sender: address,
          sudtArgs: lockHash,
          supplyToMint: params.supplyToMint.toString(),
          pricePerToken: params.pricePerToken.toString(),
          txFee: params.txFee.toString(),
        },
        signatures,
      }
    );

    return response.payload.txHash as Hash;
  }

  async buildBuyTokenSale(params: BuyTokenSaleParams): Promise<BuyTokenSale> {
    const response = await Api.post(
      this.dappServerUri,
      "/sudt-sale/build-buy-token-sale",
      {
          params
      }
    );

    const data = response.payload;
    return data;
  }

  async buyTokenSale(
    params: BuyTokenSaleParams,
    signatures: HexString[]
  ): Promise<Hash> {
    const response = await Api.post(
      this.dappServerUri,
      "/sudt-sale/buy-token-sale",
      {
        params,
        signatures,
      }
    );
    return response.payload.txHash as Hash;
  }
}

export const tokenSaleService = new TokenSaleService(
  process.env.REACT_APP_DAPP_SERVER_URI
);
