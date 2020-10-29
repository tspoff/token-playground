import _ from "lodash";
import React, { createContext, useReducer } from "react";
import { Cell } from "@ckb-lumos/base";
import { AssetData } from "../components/asset-list/AssetTransferList";
import { TokenSaleCellMetadata } from "../components/token-sale/TokenSaleCellList";
import { KnownAssets, getAssetMetadata } from "./assets";

/**
 * @remarks Collection of token sale cells and associated parsed data
 */
export interface TokenSaleCells {
  cells: Cell[]; 
  parsed: TokenSaleCellParsedData[];
}

/**
 * @remarks Parsed data fields for a token sale cell
 */
export interface TokenSaleCellParsedData {
  ckbAmount: string;
  sudtAmount: string;
  shannonsPerToken: string;
}

export interface TokenSaleCellMap {
  [index: string]: TokenSaleCells;
}

export interface State {
  tokenSaleCells: TokenSaleCellMap;
}

export const initialState = {
  tokenSaleCells: {} as TokenSaleCellMap,
};

export enum TokenSaleActions {
  SetTokenSaleCells = "SetTokenSaleCells",
}

export const reducer = (state, action) => {
  switch (action.type) {
    case TokenSaleActions.SetTokenSaleCells:
      return setTokenSaleCells(state, action.sudtArgs, action.cells, action.metadata);
    default:
      return state;
  }
};

/* Collect all known balances for a given address */
export const getTokenSaleCellsForSudtArgs = (
  state,
  sudtArgs: string 
): TokenSaleCells | undefined => {
  const cells = state.tokenSaleCells[sudtArgs];
  if (!cells) {
    return undefined 
  } else {
    return cells;
  }
};

/**
 * @remarks Set known token sale cells for a particular sudt 
 * @param state - Existing state
 * @param sudtArgs - Args for sudt 
 * @param cells - token sale cells
 * @param parsed - parsed token sale cell data (indicies will match to corresponding cell)
 */
export const setTokenSaleCells = (
  state,
  sudtArgs: string,
  cells: Cell[],
  parsed: TokenSaleCellParsedData[]
) => {
  const newState = _.cloneDeep(state);
  newState.tokenSaleCells[sudtArgs] = {
    cells,
    parsed
  }
  return newState;
};

export interface ContextProps {
  tokenSaleState: State;
  tokenSaleDispatch: any;
}

export const TokenSaleContext = createContext({} as ContextProps);

export const TokenSaleStore = ({ children }) => {
  const [tokenSaleState, tokenSaleDispatch] = useReducer(reducer, initialState);
  const value: ContextProps = { tokenSaleState, tokenSaleDispatch };
  return (
    <TokenSaleContext.Provider value={value}>
      {children}
    </TokenSaleContext.Provider>
  );
};
