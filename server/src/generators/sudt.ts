import { indexer } from "../index";
import { Script, Hash, Address } from "@ckb-lumos/base";
// import { sudt, common } from "../generator-scripts";
import {sudt, common} from "../generator-scripts";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { Cell, utils } from "@ckb-lumos/base";
import { getConfig } from "@ckb-lumos/config-manager";
import { printTxSkeleton } from "../generator-scripts/print";

export interface IssueSudtParams {
  sender: Address;
  amount: string;
  txFee: string;
}

export interface TransferSudtParams {
  udtHash: Hash;
  sender: Address;
  recipient: Address;
  amount: string;
  txFee: string;
}

export interface GetSudtBalanceParams {
  lockScript: Script;
  sudtArgs: Hash;
}

export const issueSudt = async (params: IssueSudtParams) => {
  const { sender, amount, txFee } = params;

  let txSkeleton = TransactionSkeleton({
    // @ts-ignore
    cellProvider: indexer,
  });

  txSkeleton = await sudt.issueToken(txSkeleton, sender, BigInt(amount));
  txSkeleton = await common.payFee(txSkeleton, [sender], BigInt(txFee));
  txSkeleton = await common.prepareSigningEntries(txSkeleton);

  return txSkeleton;
};

export const transferUdt = async (params: TransferSudtParams) => {
  const { sender, recipient, udtHash, amount, txFee } = params;

  let txSkeleton = TransactionSkeleton({
    // @ts-ignore
    cellProvider: indexer,
  });

  txSkeleton = await sudt.transfer(
    txSkeleton,
    [sender],
    udtHash,
    recipient,
    BigInt(amount)
  );

  txSkeleton = await common.payFee(txSkeleton, [sender], BigInt(txFee));
  txSkeleton = await common.prepareSigningEntries(txSkeleton);

  return txSkeleton;
};

export const getSudtBalance = async (params: GetSudtBalanceParams) => {
  const { lockScript, sudtArgs } = params;
  let sum = BigInt(0);

  const collector = indexer.collector({
    lock: lockScript,
    type: {
      args: sudtArgs,
      code_hash: getConfig().SCRIPTS["SUDT"].CODE_HASH,
      hash_type: getConfig().SCRIPTS["SUDT"].HASH_TYPE,
    },
  });

  const cells: Cell[] = [];
  for await (const cell of collector.collect()) {
    cells.push(cell);
  }

  return cells
    .map((cell) => utils.readBigUInt128LE(cell.data))
    .reduce((sum, amount) => (sum = sum += amount));
};
