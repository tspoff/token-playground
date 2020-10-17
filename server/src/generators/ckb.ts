import { indexer, rpc } from "../index";
import { Script } from "@ckb-lumos/base";
import { common, secp256k1Blake160 } from "../generator-scripts";
import { TransactionSkeleton, parseAddress } from "@ckb-lumos/helpers";
import { Cell } from "@ckb-lumos/base";

interface CkbTransferParams {
  sender: string;
  recipient: string;
  amount: string;
  txFee: string;
}

export const findCapacityCells = async (
  lockScript: Script,
  amount: BigInt
): Promise<Cell[]> => {
  let foundCapacity = BigInt(0);
  const capacityCells = [] as Cell[];

  const collector = indexer.collector({ lock: lockScript, type: null });

  const cells: Cell[] = [];
  for await (const cell of collector.collect()) {
    // If the cell has a type script or data, ignore
    if (!cell.cell_output.type && cell.data === "0x") {
      cells.push(cell);
    }
  }

  for (const cell of cells) {
    if (foundCapacity < amount) {
      foundCapacity = foundCapacity + BigInt(cell.cell_output.capacity);
      capacityCells.push(cell);
    }
    if (foundCapacity > amount) break;
  }

  if (foundCapacity < amount)
    throw new Error(`Insufficient capacity cells found`);

  return capacityCells;
};

export const getCkbBalance = async (lockScript: Script) => {
  let balance = BigInt(0);

  const collector = indexer.collector({ lock: lockScript, type: null });

  const cells: Cell[] = [];
  for await (const cell of collector.collect()) {
    cells.push(cell);
  }

  return cells
    .map((cell) =>
      BigInt(
        // @ts-ignore
        cell.cell_output.capacity
      )
    )
    .reduce((balance, capacity) => (balance = balance += capacity));
};

export const buildTransferCkbTx = async (params: CkbTransferParams) => {
  const { sender, recipient, amount, txFee } = params;

  const tipHeader = {
    compact_target: '0x20010000',
    dao: '0x49bfb20771031d556c8480d47f2a290059f0ac7e383b6509006f4a772ed50200',
    epoch: '0xa0006002b18',
    hash: '0x432451e23c26f45eaceeedcc261764d6485ea5c9a204ac55ad755bb8dec9a079',
    nonce: '0x8199548f8a5ac7a0f0caef1620f37b79',
    number: '0x1aef6',
    parent_hash: '0x63594a64108f19f6aed53d0dca9ab4075aac4379cb80b2097b0deac8fc16fd3b',
    proposals_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    timestamp: '0x172f6b9a4cf',
    transactions_root: '0x282dbadcd49f3e229d997875f37f4e4f19cb4f04fcf762e9639145aaa667b6f8',
    uncles_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    version: '0x0'
  }

  let txSkeleton = TransactionSkeleton({
    // @ts-ignore
    cellProvider: indexer,
  });

  txSkeleton = await common.transfer(
    txSkeleton,
    [sender],
    recipient,
    BigInt(amount),
  );

  txSkeleton = await common.payFee(
    txSkeleton,
    [sender],
    BigInt(1*10**8), //TODO: User supplied TXFEE
  )
  txSkeleton = common.prepareSigningEntries(txSkeleton);

  // let txSkeleton = TransactionSkeleton({
  //   // @ts-ignore
  //   cellProvider: indexer,
  // });

  // txSkeleton = await secp256k1Blake160.transfer(
  //   txSkeleton,
  //   sender,
  //   recipient,
  //   BigInt(amount),
  // );

  // txSkeleton = await secp256k1Blake160.payFee(
  //   txSkeleton,
  //   sender,
  //   BigInt(1*10**8), //TODO: User supplied TXFEE
  // )

  // txSkeleton = secp256k1Blake160.prepareSigningEntries(txSkeleton);
  return txSkeleton;
};
