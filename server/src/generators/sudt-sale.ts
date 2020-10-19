import { indexer } from "../index";
import { Script, Hash, Address } from "@ckb-lumos/base";
import { sudt, common, sudtSale } from "../generator-scripts";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { Cell, utils } from "@ckb-lumos/base";
import { getConfig } from "@ckb-lumos/config-manager";

export interface CreateTokenSaleParams {
  udtHash: Hash;
  ckbAmount: string;
  udtAmount: string;
  price: string;
  txFee: string;
}

export interface BuyTokenSaleParams {
  udtHash: Hash;
  sender: Address;
  recipient: Address;
  ckbAmount: string;
  udtAmount: string;
  price: string;
  txFee: string;
}

export interface GetTokenSaleCells {
  udtHash: Hash;
}

export const createTokenSale = async (params: CreateTokenSaleParams) => {
  const { udtHash, ckbAmount, udtAmount, price, txFee } = params;

  let txSkeleton = TransactionSkeleton({
    // @ts-ignore
    cellProvider: indexer,
  });

  return txSkeleton;
};

export const buyTokenSale = async (params: BuyTokenSaleParams) => {
  const { sender, recipient, udtHash, ckbAmount, udtAmount, price, txFee } = params;

  let txSkeleton = TransactionSkeleton({
    // @ts-ignore
    cellProvider: indexer,
  });

  return txSkeleton;
};

export const getTokenSaleCells = async (params: GetTokenSaleCells) => {
};
