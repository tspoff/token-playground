import React, { createContext, useReducer } from "react";
import {Cell, Hash} from "@ckb-lumos/base";
import { Transaction } from "../services/DappService";
import _ from "lodash";

/*
  Store visibility and persistent state for application Modals
*/
export interface Modal {
  visible: boolean;
}

export interface WalletModal extends Modal {
  activePanel?: WalletModalPanels;
  txToSign?: Transaction;
  error?: string;
}

export interface TransferModal extends Modal {
  activePanel?: TransferModalPanels;
  assetId?: Hash;
  error?: string;
  nftCell?: Cell;
}

interface State {
  walletModal: WalletModal;
  transferModal: TransferModal;
}

export enum WalletModalPanels {
  VIEW_ACCOUNT,
  CONNECT_ACCOUNT,
}

export enum TransferModalPanels {
  TRANSFER_CKB,
  TRANSFER_SUDT,
  TRANSFER_NFT,
}

export enum Modals {
  walletModal = "walletModal",
  transferModal = "transferModal",
}

export enum ModalActions {
  setModalState = "setModalState",
  setModalError = "setModalError",
}

const initialState: State = {
  walletModal: {
    visible: false,
    activePanel: WalletModalPanels.CONNECT_ACCOUNT,
  },
  transferModal: {
    visible: false,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case ModalActions.setModalState:
      return setModalState(state, action.modalName, action.newState);
    case ModalActions.setModalError:
      return setModalError(state, action.modalName, action.error);
    default:
      return state;
  }
};

const setModalState = (state, modalName: string, modalState: Modal) => {
  const newState = _.cloneDeep(state);
  newState[modalName] = { ...state[modalName], ...modalState };
  newState[modalName].error = undefined; // Clear Error
  return newState;
};

const setModalError = (state, modalName: string, error: string) => {
  const newState = _.cloneDeep(state);
  newState[modalName].error = error;
  return newState;
};

export interface ContextProps {
  modalState: State;
  modalDispatch: any;
}

export const ModalContext = createContext({} as ContextProps);

export const ModalStore = ({ children }) => {
  const [modalState, modalDispatch] = useReducer(reducer, initialState);
  const value: ContextProps = { modalState, modalDispatch };
  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
