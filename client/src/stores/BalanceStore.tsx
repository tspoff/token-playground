import _ from "lodash";
import React, { createContext, useReducer } from "react";
import { AssetData } from "../components/asset-list/AssetTransferList";
import { KnownAssets, getAssetMetadata } from "./assets";

export interface BalanceMap {
  [index: string]: bigint; // Lock Hash -> Balance
}

export interface State {
  ckbBalances: BalanceMap;
  sudtBalances: {
    [index: string]: BalanceMap;
  };
}

export const initialState = {
  ckbBalances: {} as BalanceMap,
  sudtBalances: {} as BalanceMap,
};

export enum BalanceActions {
  SetCkbBalance = "setCkbBalance",
  SetSudtBalance = "SetSudtBalance",
}

export const reducer = (state, action) => {
  switch (action.type) {
    case BalanceActions.SetCkbBalance:
      return setCkbBalance(state, action.lockHash, action.balance);
      case BalanceActions.SetSudtBalance:
        return setSudtBalance(state, action.lockHash, action.sudtArgs, action.balance);
    default:
      return state;
  }
};


/* Collect all known balances for a given address */
export const getAssetBalancesForAddress = (
  state,
  lockHash
): AssetData[] => {
  const sudtIds = Object.keys(state.sudtBalances);
  const ckbBalance = state.ckbBalances[lockHash];
  const assets = [] as AssetData[];

  if (ckbBalance) {
    assets.push({
      id: KnownAssets.CKB,
      balance: ckbBalance,
    })
  }

  for (const id of sudtIds) {
    if (state.sudtBalances[id][lockHash])
      assets.push({
        id,
        balance: state.sudtBalances[id][lockHash],
      });
  }

  return assets;
};

export const getSudtBalance = (
  state,
  sudtArgs: string,
  lockHash: string
): BigInt | undefined => {
  const balance = _.get(state.sudtBalances, `${sudtArgs}.${lockHash}`);

  if (!balance) {
    return undefined;
  } else {
    return BigInt(balance);
  }
};

export const setSudtBalance = (
  state,
  lockHash: string,
  sudtArgs: string,
  balance: BigInt
) => {
  const newState = _.cloneDeep(state);
  _.set(newState.sudtBalances, `${sudtArgs}.${lockHash}`, balance);
  return newState;
};

export const setCkbBalance = (state, lockHash: string, balance: BigInt) => {
  const newState = _.cloneDeep(state);
  _.set(newState.ckbBalances, `${lockHash}`, balance);
  return newState;
};

export interface ContextProps {
  balanceState: State;
  balanceDispatch: any;
}

export const BalanceContext = createContext({} as ContextProps);

export const BalanceStore = ({ children }) => {
  const [balanceState, balanceDispatch] = useReducer(reducer, initialState);
  const value: ContextProps = { balanceState, balanceDispatch };
  return (
    <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
  );
};
