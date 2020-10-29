import _ from "lodash";
import React, { createContext, useReducer } from "react";
import { Hash, Cell, Script } from "@ckb-lumos/base";

// Fetch NFTS on - Initial load w/ account, account switch, new block
export interface NftMap {
  [index: string]: Cell;
}

export interface State {
  ownerLockHash: Hash;
  nfts: NftMap;
}

export const initialState = {
  ownerLockHash: "",
  nfts: {} as NftMap,
};

export enum NftActions {
  SetNfts = "SetNfts",
}

export const reducer = (state, action) => {
  switch (action.type) {
    case NftActions.SetNfts:
      return setNfts(state, action.ownerLockHash, action.nfts);

    default:
      return state;
  }
};

// export const getOwnedNftsByGovernance = (state, governanceLock: Script): NftMap => {
//   const ownedNfts: NftMap = {};
//   for (const key of Object.keys(state.nfts)) {
//     state.nfts[key].
//   }
// }

/**
 * 
 * @param state Existing state
 * @param ownerLockHash owner lock hash of NFT cells to store
 * @param nfts NFT cells to store
 */
export const setNfts = (state, ownerLockHash, nfts: Cell[]) => {
  const newState = _.cloneDeep(state);

  // Cell Array -> Cell Map by nftId for easier access
  const newNfts: NftMap = newState.nfts;
  nfts.forEach((nft) => {
    newNfts[nft.data] = nft;
  });

  _.set(newState, `nfts`, newNfts);
  _.set(newState, `ownerLockHash`, ownerLockHash);

  return newState;
};

export interface ContextProps {
  nftState: State;
  nftDispatch: any;
}

export const NftContext = createContext({} as ContextProps);

export const NftStore = ({ children }) => {
  const [nftState, nftDispatch] = useReducer(reducer, initialState);
  const value: ContextProps = { nftState, nftDispatch };
  return (
    <NftContext.Provider value={value}>{children}</NftContext.Provider>
  );
};
