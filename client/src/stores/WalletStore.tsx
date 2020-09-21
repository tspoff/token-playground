/*
    Accounts are stored in the in-memory wallet
    The user can switch between stored accounts at-will
*/
import _ from "lodash";
import { Account } from "../utils/Account";
import React, { createContext, useReducer } from "react";
import { Wallet } from "../services/wallet/Wallet";

// UDT Typehash -> Owner Lockhash -> Amount
export interface AccountMap {
  [index: string]: Account;
}

interface State {
  wallet: Wallet | null;
  accounts: AccountMap;
  activeAccount: Account | null;
}

export const initialState: State = {
  accounts: {} as AccountMap,
  activeAccount: null,
  wallet: null,
};

export enum WalletActions {
  addAccounts = "addAccounts",
  setActiveAccount = "setActiveAccount",
  setWallet = "setWallet",
}

export const reducer = (state, action) => {
  switch (action.type) {
    case WalletActions.addAccounts:
      return addAccounts(state, action.accounts);
    case WalletActions.setActiveAccount:
      return setActiveAccount(state, action.lockHash);
    case WalletActions.setWallet:
      return setWallet(state, action.wallet);
    default:
      return state;
  }
};

export const isWalletConnected = (state: State) => {
  if (!state.activeAccount || !state.wallet) return false;
  return true;
};

export const addAccounts = (state, accounts: Account[]) => {
  const newState = _.cloneDeep(state);
  Object.keys(accounts).forEach((key) => {
    newState.accounts[accounts[key].lockHash] = accounts[key];
  });
  return newState;
};

export const setActiveAccount = (state: State, lockHash: string) => {
  const account = state.accounts[lockHash];
  const newState = _.cloneDeep(state);
  if (account) {
    newState.activeAccount = account;
  } else {
    throw new Error(`Account with lockHash ${lockHash} not found`);
  }
  return newState;
};

export const setWallet = (state: State, wallet: Wallet) => {
  const newState = _.cloneDeep(state);
  newState.wallet = wallet;
  return newState;
};

export interface ContextProps {
  walletState: State;
  walletDispatch: any;
}

export const WalletContext = createContext({} as ContextProps);

export const WalletStore = ({ children }) => {
  const [walletState, walletDispatch] = useReducer(reducer, initialState);
  const value: ContextProps = { walletState, walletDispatch };
  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
