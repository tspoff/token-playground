import { Cell, HexString, Hash, Address, Script } from "@ckb-lumos/base";
import { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { Api } from "./Api";

export interface CreateTokenSaleParams {
  sender: Address;
  supplyToMint: BigInt;
  pricePerToken: BigInt;
  txFee: BigInt;
}

export interface BuyTokenSaleParams {
  udtTypeHash: Hash;
  sender: Address;
  amountToBuy: BigInt;
  txFee: BigInt;
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

class TokenSaleService {
  dappServerUri: string;
  constructor(dappServerUri) {
    this.dappServerUri = dappServerUri;
  }

  async buildCreateTokenSale(params: CreateTokenSaleParams): Promise<CreateTokenSale> {
    const response = await Api.post(
      this.dappServerUri,
      "/sudt-sale/build-create-token-sale",
      {
        sender: params.sender,
        supplyToMint: params.supplyToMint.toString(),
        pricePerToken: params.pricePerToken.toString(),
        txFee: params.txFee.toString()
      }
    );

    const data = response.payload;
    return data;
  }

  async createTokenSale(
    params: CreateTokenSaleParams,
    signatures: HexString[]
  ): Promise<Hash> {
    const response = await Api.post(this.dappServerUri, "/sudt-sale/create-token-sale", {
      params,
      signatures,
    });

    return response.payload.txHash as Hash;
  }

  async buildBuyTokenSale(params: BuyTokenSaleParams): Promise<BuyTokenSale> {
    const response = await Api.post(
      this.dappServerUri,
      "/sudt-sale/build-buy-token-sale",
      {
        udtTypeHash: params.udtTypeHash,
        sender: params.sender,
        amountToBuy: params.amountToBuy.toString(),
        txFee: params.txFee.toString()
      }
    );

    const data = response.payload;
    return data;
  }

  async buyTokenSale(
    params: BuyTokenSaleParams,
    signatures: HexString[]
  ): Promise<Hash> {
    const response = await Api.post(this.dappServerUri, "/sudt-sale/buy-token-sale", {
      params,
      signatures,
    });
    return response.payload.txHash as Hash;
  }
}

export const tokenSaleService = new TokenSaleService(
  process.env.REACT_APP_DAPP_SERVER_URI
);
