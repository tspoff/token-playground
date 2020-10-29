import { addCellDep, addCellDepsFromConfig, isAcpScript } from "./helper";
import {
  utils,
  Hash,
  Address,
  Cell,
  Script,
  Header,
  CellCollector as CellCollectorInterface,
  values,
  HexString,
} from "@ckb-lumos/base";
const { toBigUInt128LE, readBigUInt128LE, computeScriptHash } = utils;
import secp256k1Blake160Multisig from "./secp256k1_blake160_multisig";
import { FromInfo, parseFromInfo } from "./from_info";
import common from "./common";
import {
  parseAddress,
  minimalCellCapacity,
  TransactionSkeletonType,
  Options,
} from "@ckb-lumos/helpers";
import { Set, List } from "immutable";
import { getConfig, Config } from "@ckb-lumos/config-manager";
import { CellCollector as LocktimeCellCollector } from "./locktime_pool";
import anyoneCanPay, {
  CellCollector as AnyoneCanPayCellCollector,
} from "./anyone_can_pay";
const { ScriptValue } = values;
import secp256k1Blake160 from "./secp256k1_blake160";
import {
  prettyFormatTxSkeleton,
  printCell,
  printScript,
  printTxSkeleton,
} from "./print";

export type Token = Hash;

/**
 * Find sufficient sUDT balances to cover required value. Add input cells and change cell as required
 * Note that unlock CKB capacity injection, this DOES NOT consider existing sUDT balances in the skeleton
 * @param txSkeleton Existing skeleton to inject capacity into
 * @param lockScript Lock script of sUDT to find value for
 * @param sudtTypeScript Type script information for sUDT
 * @param requiredValue Balance of sUDT to inject
 */
export async function injectSudtValue(
  txSkeleton: TransactionSkeletonType,
  lockScript: Script,
  sudtTypeScript: Script,
  requiredValue: bigint
): Promise<TransactionSkeletonType> {
  const cellProvider = txSkeleton.get("cellProvider");

  let totalValue: bigint = BigInt(0);

  // Find cells with appropriate lock & type scripts
  const cellCollector = cellProvider.collector({
    lock: lockScript,
    type: sudtTypeScript,
  });

  const lockHash = computeScriptHash(lockScript);
  const typeHash = computeScriptHash(sudtTypeScript);

  for await (const inputCell of cellCollector.collect()) {
    if (totalValue >= requiredValue) {
      break;
    }

    const cellLockHash = computeScriptHash(inputCell.cell_output.lock);
    const hasType = !!inputCell.cell_output.type;
    let cellTypeHash: string | undefined = undefined;

    if (hasType) {
      cellTypeHash = computeScriptHash(inputCell.cell_output.type);
    }

    // On valid cell
    if (cellLockHash === lockHash && hasType && cellTypeHash === typeHash) {
      const cellValue = utils.readBigUInt128LE(inputCell.data);
      totalValue = totalValue + cellValue;

      console.log("you reached a valid cell!", {
        cellValue: cellValue.toString(),
        totalValue: totalValue.toString(),
        prevTotalValue: (totalValue - cellValue).toString(),
      });

      // Add sudt cell to skeleton
      txSkeleton = txSkeleton.update("inputs", (inputs) => {
        return inputs.push(inputCell);
      });

      // If we've met totalValue, return change
      const diff = totalValue - requiredValue;
      console.log("have we met target?", {
        totalValue: totalValue.toString(),
        requiredValue: requiredValue.toString(),
        diff: diff.toString(),
      });
      if (diff > 0) {
        // Generate intended output
        const changeCell: Cell = {
          cell_output: {
            capacity: "0x0",
            lock: lockScript,
            type: sudtTypeScript,
          },
          data: toBigUInt128LE(diff),
          out_point: undefined,
          block_hash: undefined,
        };

        const capacity = minimalCellCapacity(changeCell);
        changeCell.cell_output.capacity = "0x" + capacity.toString(16);

        // Add to outputs
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
          return outputs.push(changeCell);
        });
      }
    }
  }
  return txSkeleton;
}

export function parseTokenSaleArgs(
  encodedArgs: HexString
): { lockHash: HexString; shannonsPerToken: bigint; uniqueId: string } {
  const encodedLockHash = encodedArgs.slice(0, 32);
  const encodedPrice = "0x" + encodedArgs.slice(32, 40);
  const encodedUniqueId = "0x" + encodedArgs.slice(40, 44);

  return {
    lockHash: encodedLockHash,
    shannonsPerToken: utils.readBigUInt64LE(encodedPrice),
    uniqueId: encodedUniqueId,
  };
}

/**
 * Find token sale cells matching specified parameters. Add to skeleton inputs, and add correct output to outputs
 * @param txSkeleton Existing skeleton
 * @param sudtArgs Lock hash of sUDT owner
 * @param amountToBuy Amount of sUDT to buy
 * @param price Exact amount of shannons per token to purhase sUDT for
 */
export async function injectTokenSale(
  txSkeleton: TransactionSkeletonType,
  sudtArgs: HexString,
  amountToBuy: bigint,
  price: bigint,
  { config = undefined }: Options = {}
): Promise<TransactionSkeletonType> {
  const cellProvider = txSkeleton.get("cellProvider");
  config = config || getConfig();

  const requiredCkb = amountToBuy * price;

  const saleTemplate = config.SCRIPTS.SUDT_SALE;
  const template = config.SCRIPTS.SUDT;

  const sudtSaleScript = {
    code_hash: saleTemplate.CODE_HASH,
    hash_type: saleTemplate.HASH_TYPE,
    args: generateTokenSaleArgs(sudtArgs, price, "0x00000000"),
  };

  const sudtTypeScript = {
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: sudtArgs,
  };

  // Find cells with appropriate lock & type scripts
  const cellCollector = cellProvider.collector({
    lock: sudtSaleScript,
    type: sudtTypeScript,
  });

  const lockHash = computeScriptHash(sudtSaleScript);
  const typeHash = computeScriptHash(sudtTypeScript);
  let foundValue: bigint = BigInt(0);

  for await (const inputCell of cellCollector.collect()) {
    if (foundValue >= amountToBuy) {
      break;
    }

    const cellLockHash = computeScriptHash(inputCell.cell_output.lock);
    const hasType = !!inputCell.cell_output.type;
    let cellTypeHash: string | undefined = undefined;

    if (hasType) {
      cellTypeHash = computeScriptHash(inputCell.cell_output.type);
    }

    // On valid cell
    if (cellLockHash === lockHash && hasType && cellTypeHash === typeHash) {
      const cellValue = utils.readBigUInt128LE(inputCell.data);
      foundValue = foundValue + cellValue;

      console.log("you reached a valid cell!", {
        cellValue: cellValue.toString(),
        foundValue: foundValue.toString(),
        prevTotalValue: (foundValue - cellValue).toString(),
      });

      // Add sudt cell to skeleton
      txSkeleton = txSkeleton.update("inputs", (inputs) => {
        return inputs.push(inputCell);
      });

      // If we've met foundValue, return change
      const diff = foundValue - amountToBuy;
      console.log("have we met target?", {
        foundValue: foundValue.toString(),
        requiredValue: amountToBuy.toString(),
        diff: diff.toString(),
      });
      if (diff > 0) {
        // Generate intended output
        const changeCell: Cell = {
          cell_output: {
            capacity: "0x0",
            lock: sudtSaleScript,
            type: sudtTypeScript,
          },
          data: toBigUInt128LE(diff),
          out_point: undefined,
          block_hash: undefined,
        };

        // Add required CKB to purhase to cell cost
        const capacity = minimalCellCapacity(changeCell) + requiredCkb;
        changeCell.cell_output.capacity = "0x" + capacity.toString(16);

        // Add to outputs
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
          return outputs.push(changeCell);
        });
      }
    }
  }
  return txSkeleton;
}

/**
 * Remove '0x' prefix from Hex string convenience method
 * @param input Hex string to remove '0x' prefix from
 */
function removeHexPrefix(input: HexString): HexString {
  return input.slice(2);
}

/**
 * Generate encoded arguments for token sale cell
 * @param lockScript Lock script of sUDT governor
 * @param shannonsPerToken Price per sUDT, in Shannons
 * @param uniqueId Unique identifier for token sale cell (4 arbitrary bytes)
 */
function generateTokenSaleArgs(
  lockHash: HexString,
  shannonsPerToken: bigint,
  uniqueId: string
): string {
  const encodedPrice = utils.toBigUInt64LE(shannonsPerToken);
  const encodedArgs = `${lockHash}${removeHexPrefix(
    encodedPrice
  )}${removeHexPrefix(uniqueId)}`;

  console.log({
    lockHash,
    encodedPrice,
    uniqueId,
    encodedPriceNoPrefix: removeHexPrefix(encodedPrice),
    uniqueIdNoPrefix: removeHexPrefix(uniqueId),
    args: encodedArgs,
    length: encodedArgs.length,
  });

  return encodedArgs;
}

/**
 * Generate a transaction skeleton to create an sUDT sale cell, finding sufficient CKB capacity and minting sUDT value to complete the transaction
 * Can only be issued by the owner of the sUDT, as it mints sUDT during the transaction
 * @remarks Note that currently all token sale cells will use Id 0
 * @remarks There is an injectSudtCapacity() function that could be used to allow non-creators of a token to issue sale for an arbitrary token
 * @param txSkeleton Existing skeleton to expand
 * @param fromInfo sUDT owner account (sUDT args will be generated from here)
 * @param udtAmount Amount of sUDT value to mint & sell
 * @param price Price to purchase one sUDT, in shannons
 */
export async function createTokenSale(
  txSkeleton: TransactionSkeletonType,
  fromInfo: FromInfo,
  udtAmount: bigint,
  price: bigint,
  capacity?: bigint,
  tipHeader?: Header,
  { config = undefined }: Options = {}
): Promise<TransactionSkeletonType> {
  config = config || getConfig();

  const template = config.SCRIPTS.SUDT;
  const saleTemplate = config.SCRIPTS.SUDT_SALE;

  if (!template || !saleTemplate) {
    throw new Error("Provided config does not have SUDT script setup!");
  }

  // Add deps
  txSkeleton = addCellDepsFromConfig(txSkeleton, [template, saleTemplate]);

  // Generate required scripts for inputs / outputs
  const fromScript = parseFromInfo(fromInfo, { config }).fromScript;

  const sudtSaleScript = {
    code_hash: saleTemplate.CODE_HASH,
    hash_type: saleTemplate.HASH_TYPE,
    args: generateTokenSaleArgs(
      computeScriptHash(fromScript),
      price,
      "0x00000000"
    ),
  };

  const sudtTypeScript = {
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: computeScriptHash(fromScript),
  };

  // Generate intended output
  const saleCellOutput: Cell = {
    cell_output: {
      capacity: "0x0",
      lock: sudtSaleScript,
      type: sudtTypeScript,
    },
    data: toBigUInt128LE(udtAmount),
    out_point: undefined,
    block_hash: undefined,
  };

  // Allocate capacity to output cell
  if (!capacity) {
    capacity = minimalCellCapacity(saleCellOutput);
  }
  capacity = BigInt(capacity);

  saleCellOutput.cell_output.capacity = "0x" + capacity.toString(16);

  txSkeleton = txSkeleton.update("outputs", (outputs) => {
    return outputs.push(saleCellOutput);
  });

  const outputIndex = txSkeleton.get("outputs").size - 1;

  // fix entry
  txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
    return fixedEntries.push({
      field: "outputs",
      index: outputIndex,
    });
  });

  txSkeleton = await common.injectCapacity(
    txSkeleton,
    [fromInfo],
    BigInt(saleCellOutput.cell_output.capacity),
    undefined,
    tipHeader,
    {
      config,
    }
  );

  return txSkeleton;
}

/**
 * Generate a transaction skeleton to purchase an sUDT from a token sale cell
 * @param txSkeleton Existing skeleton
 * @param fromInfos Buying acocount
 * @param sudtArgs sUDT ID to buy (Lock hash of sUDT owner)
 * @param toAddress Recipient address for purchased sUDT
 * @param amount Value of sUDT to buy
 * @param price Exact price to buy sUDT for
 */
export async function buyTokenSale(
  txSkeleton: TransactionSkeletonType,
  fromInfo: FromInfo,
  sudtArgs: Token,
  toAddress: Address,
  amount: bigint,
  price: bigint,
  capacity?: bigint,
  tipHeader?: Header,
  {
    config = undefined,
    LocktimePoolCellCollector = LocktimeCellCollector,
  }: Options & {
    LocktimePoolCellCollector?: any;
  } = {}
): Promise<TransactionSkeletonType> {
  config = config || getConfig();

  const SUDT_SCRIPT = config.SCRIPTS.SUDT;
  const SUDT_SALE_SCRIPT = config.SCRIPTS.SUDT_SALE;

  if (!SUDT_SCRIPT || !SUDT_SALE_SCRIPT) {
    throw new Error("Provided config does not have a dependency script setup!");
  }

  if (!toAddress) {
    throw new Error("You must provide a to address!");
  }

  // Add deps
  txSkeleton = addCellDepsFromConfig(txSkeleton, [
    SUDT_SCRIPT,
    SUDT_SALE_SCRIPT,
  ]);

  // Generate required scripts for inputs / outputs
  const fromScript = parseFromInfo(fromInfo, { config }).fromScript;
  const toScript = parseAddress(toAddress, { config });

  const sudtSaleScript = {
    code_hash: SUDT_SALE_SCRIPT.CODE_HASH,
    hash_type: SUDT_SALE_SCRIPT.HASH_TYPE,
    args: generateTokenSaleArgs(sudtArgs, price, "0x00000000"),
  };

  const sudtTypeScript = {
    code_hash: SUDT_SCRIPT.CODE_HASH,
    hash_type: SUDT_SCRIPT.HASH_TYPE,
    args: sudtArgs,
  };

  const boughtSudt: Cell = {
    cell_output: {
      capacity: "0x0",
      lock: toScript,
      type: sudtTypeScript,
    },
    data: toBigUInt128LE(amount),
    out_point: undefined,
    block_hash: undefined,
  };

  if (!capacity) {
    capacity = minimalCellCapacity(boughtSudt);
  }
  capacity = BigInt(capacity);

  boughtSudt.cell_output.capacity = "0x" + capacity.toString(16);

  txSkeleton = txSkeleton.update("outputs", (outputs) => {
    return outputs.push(boughtSudt);
  });

  const outputIndex = txSkeleton.get("outputs").size - 1;

  // fix entry
  txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
    return fixedEntries.push({
      field: "outputs",
      index: outputIndex,
    });
  });

  const requiredCkb = amount * price;

  // Find appropriate sale cells, and add change

  txSkeleton = await injectTokenSale(txSkeleton, sudtArgs, amount, price);

  const requiredCapacity = requiredCkb + capacity;

  /* Inject capacity for:
      - Require CKB to purchase specified token amount
      - Capacity for output cell
    */
  txSkeleton = await common.injectCapacity(
    txSkeleton,
    [fromInfo],
    requiredCapacity,
    undefined,
    tipHeader,
    {
      config,
    }
  );

  return txSkeleton;
}

function _generateSudtScript(token: Hash, config: Config): Script {
  const SUDT_SCRIPT = config.SCRIPTS.SUDT!;
  // TODO: check token is a valid hash
  return {
    code_hash: SUDT_SCRIPT.CODE_HASH,
    hash_type: SUDT_SCRIPT.HASH_TYPE,
    args: token,
  };
}

export default {
  createTokenSale,
  buyTokenSale,
};
