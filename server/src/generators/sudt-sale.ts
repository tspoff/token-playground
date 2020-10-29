import { indexer } from "../index";
import { Script, Hash, Address, HexString } from "@ckb-lumos/base";
import { sudt, common, sudtSale } from "../generator-scripts";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { Cell, utils } from "@ckb-lumos/base";
import { getConfig } from "@ckb-lumos/config-manager";
import { buyTokenSale, createTokenSale } from "..//generator-scripts/sudt_sale";
export interface CreateTokenSaleParams {
  sender: Address;
  sudtArgs: string;
  supplyToMint: string;
  pricePerToken: string;
  txFee: string;
}

export interface BuyTokenSaleParams {
  sudtArgs: Hash;
  sender: Address;
  recipient: Address;
  udtAmount: string;
  pricePerToken: string;
  txFee: string;
}

export interface GetTokenSaleCells {
  sudtArgs: HexString;
}

export interface TokenSaleMetadata {
  ckbAmount: string;
  sudtAmount: string;
  shannonsPerToken: string;
}

export const getTokenSaleCells = async (
  params: GetTokenSaleCells
): Promise<{ cells: Cell[]; metadata: TokenSaleMetadata[] }> => {
  const { sudtArgs } = params;

  const config = getConfig();

  const collector = indexer.collector({
    lock: {
      code_hash: config.SCRIPTS["SUDT_SALE"].CODE_HASH,
      hash_type: config.SCRIPTS["SUDT_SALE"].HASH_TYPE,
      args: "0x"
    },
    type: {
      code_hash: config.SCRIPTS["SUDT"].CODE_HASH,
      hash_type: config.SCRIPTS["SUDT"].HASH_TYPE,
      args: sudtArgs,
    },
    argsLen: "any",
  });

  const cells: Cell[] = [];
  const metadata: TokenSaleMetadata[] = [];
  for await (const cell of collector.collect()) {
    cells.push(cell);
    metadata.push(decodeTokenSaleData(cell));
  }

  return { cells, metadata };
};

export const decodeTokenSaleData = (cell: Cell): TokenSaleMetadata => {
  const ckbAmount = BigInt(cell.cell_output.capacity).toString(10);
  const sudtAmount = utils.readBigUInt128LE(cell.data).toString();

  // args: {lock hash - 32} {price - 16} {id - 4}
  const slice = '0x' + cell.cell_output.lock.args.slice(32, 48);
  const shannonsPerToken = utils
    .readBigUInt64LE(slice)
    .toString();

    console.log('shannonsPerToken', cell.cell_output.lock.args, slice, shannonsPerToken, utils
    .readBigUInt64LE(slice))

  return {
    ckbAmount,
    sudtAmount,
    shannonsPerToken,
  };
};

/**
 * Generate transaction skeleton to issue a token sale
 * @param params High level parameters for token sale
 */
export const buildCreateTokenSale = async (params: CreateTokenSaleParams) => {
  const { sender, sudtArgs, supplyToMint, pricePerToken, txFee } = params;
  console.log("params", params);

  const ckbAmount = BigInt(supplyToMint) * BigInt(pricePerToken);

  let txSkeleton = TransactionSkeleton({
    // @ts-ignore
    cellProvider: indexer,
  });

  // Generate for sUDT of sender account
  txSkeleton = await createTokenSale(
    txSkeleton,
    sender,
    BigInt(supplyToMint),
    BigInt(pricePerToken)
  );

  txSkeleton = await common.payFee(txSkeleton, [sender], BigInt(txFee));
  txSkeleton = await common.prepareSigningEntries(txSkeleton);

  return txSkeleton;
};

/**
 * Generate transaction skeleton to buy tokens
 * @param params High level parameters for token purchase
 */
export const buildBuyTokenSale = async (params: BuyTokenSaleParams) => {
  const {
    sender,
    recipient,
    sudtArgs,
    udtAmount,
    pricePerToken,
    txFee,
  } = params;

  let txSkeleton = TransactionSkeleton({
    // @ts-ignore
    cellProvider: indexer,
  });

  txSkeleton = await buyTokenSale(
    txSkeleton,
    sender,
    sudtArgs,
    recipient,
    BigInt(udtAmount),
    BigInt(pricePerToken)
  );

  txSkeleton = await common.payFee(txSkeleton, [sender], BigInt(txFee));
  txSkeleton = await common.prepareSigningEntries(txSkeleton);

  return txSkeleton;
};
