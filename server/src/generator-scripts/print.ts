import {
  utils,
  Hash,
  Address,
  Cell,
  CellDep,
  Script,
  Header,
  CellCollector as CellCollectorInterface,
  values,
  HexString,
  OutPoint
} from "@ckb-lumos/base";
const { toBigUInt128LE, readBigUInt128LE, computeScriptHash } = utils;
import {
  parseAddress,
  generateAddress,
  minimalCellCapacity,
  TransactionSkeletonType,
  Options,
} from "@ckb-lumos/helpers";
import { Set, List } from "immutable";
import { getConfig, Config } from "@ckb-lumos/config-manager";

/*
export interface TransactionSkeletonInterface {
    cellProvider: CellProvider | null;
    cellDeps: List<CellDep>;
    headerDeps: List<Hash>;
    inputs: List<Cell>;
    outputs: List<Cell>;
    witnesses: List<HexString>;
    fixedEntries: List<{
        field: string;
        index: number;
    }>;
    signingEntries: List<{
        type: string;
        index: number;
        message: string;
    }>;
    inputSinces: Map<number, PackedSince>;
}
*/

interface PrettyCell {
    cell_output: {
        capacity: HexString;
        lock: Script;
        lockName?: string;
        parsedLock?: string;
        type?: Script;
        typeName?: string;
        parsedType?: string;
      };
      data: HexString;
      parsedData?: string;
      out_point?: OutPoint;
      block_hash?: Hash;
      block_number?: HexString;
}

export interface PrettySkeleton {
    cellDeps: CellDep[];
    inputs: PrettyCell[];
    outputs: PrettyCell[];
    witnesses: HexString[];
    fixedEntries: {field: string, index: number}[];
    signingEntries: {
        type: string;
        index: number;
        message: string;
    }[];
}

export function prettyFormatTxSkeleton(txSkeleton: TransactionSkeletonType): PrettySkeleton {
    const pretty: PrettySkeleton = {
        cellDeps: [],
        inputs: [],
        outputs: [],
        witnesses: [],
        fixedEntries: [],
        signingEntries: []
    };

    for (const dep of txSkeleton.cellDeps) {
        pretty.cellDeps.push(dep);
    }

    for (const input of txSkeleton.inputs) {
        pretty.inputs.push(prettyParseCell(input));
    }

    for (const output of txSkeleton.outputs) {
        pretty.outputs.push(prettyParseCell(output));
    }

    for (const witness of txSkeleton.witnesses) {
        pretty.witnesses.push(witness);
    }

    for (const fixedEntry of txSkeleton.fixedEntries) {
        pretty.fixedEntries.push(fixedEntry);
    }

    for (const entry of txSkeleton.signingEntries) {
        pretty.signingEntries.push(entry);
    }

    return pretty;
}

const argsParsers = {
    'SUDT': parseStandardLockArgs,
    'SECP256K1_BLAKE160': parseStandardLockArgs,
    'NFT': parseStandardLockArgs,
    'SUDT_SALE': parseStandardLockArgs,
}

const dataParsers = {
    'SUDT': parseSudtData,
}

const canParse = {
    'SUDT': true,
    'SECP256K1_BLAKE160': true,
    'NFT': true,
    'SUDT_SALE': true,
}

const canParseData = {
    'SUDT': true,
}

function prettyParseCell(cell: Cell): PrettyCell {
    const pretty: PrettyCell = {...cell};

    pretty.cell_output.capacity = BigInt(cell.cell_output.capacity).toString(10);
    if (cell.block_number) {
        pretty.block_number = BigInt(cell.block_number).toString(10);
    }
    
    const lockName = getScriptName(cell.cell_output.lock);
    const typeName = cell.cell_output.type ? getScriptName(cell.cell_output.type) : undefined;

    if (lockName && canParse[lockName]) {
        pretty.cell_output.lockName = lockName;
        pretty.cell_output.parsedLock = argsParsers[lockName](pretty.cell_output.lock);
    }

    if (typeName && canParse[typeName]) {
        pretty.cell_output.typeName = typeName;
        pretty.cell_output.parsedType = argsParsers[lockName](pretty.cell_output.type);

        if (canParseData[typeName]) {
            pretty.parsedData = dataParsers[typeName](pretty.data);
        }
    }

    return pretty;
}

export function printCell(cell: Cell, message: string | undefined = undefined) {
    if (message) {
        console.log(message);
    }
    
    console.dir(cell, {depth: null});
}

export function printScript(script: Script, message: string | undefined = undefined) {
    if (message) {
        console.log(message);
    }
    
    console.dir(script, {depth: null});
}

function getScriptName(script: Script): string | undefined {
    const config = getConfig();
    for (const key of Object.keys(config.SCRIPTS)) {
        if (config.SCRIPTS[key].CODE_HASH == script.code_hash && config.SCRIPTS[key].HASH_TYPE == script.hash_type) {
            return key;
        }
    }
    return undefined;
}

export function printTxSkeleton(txSkeleton: TransactionSkeletonType, message: string | undefined = undefined) {
    const pretty = prettyFormatTxSkeleton(txSkeleton);
    console.log(`------ Transaction (${message ? message : ""}) ------`);
    console.dir(pretty, {depth: null});
    // console.log(JSON.stringify(pretty, null, 2));
}

// Return address that corresponds to lock hash
function parseStandardLockArgs(lockScript: Script): {address: string} {
    return {address: generateAddress(lockScript)};
}

function parseSudtData(data: HexString): {amount: string} {
    return {amount: utils.readBigUInt128LE(data).toString()};
}