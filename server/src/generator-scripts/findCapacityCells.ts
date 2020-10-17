import { indexer, rpc } from "../index";
import { Script } from "@ckb-lumos/base";
import { secp256k1Blake160 } from "@ckb-lumos/common-scripts";
import { Cell } from "@ckb-lumos/base";

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
