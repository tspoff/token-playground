import { useContext, useEffect } from "react";

import { BalanceContext, BalanceActions } from "../stores/BalanceStore";
import { WalletContext } from "../stores/WalletStore";
import { dappService } from "../services/DappService";
import React from "react";
import { useInterval } from "../hooks/useInterval";
import {
  TxTrackerContext,
  getPendingTx,
  TxTrackerActions,
} from "../stores/TxTrackerStore";
import { NftContext, NftActions } from "../stores/NftStore";
import { nftService } from "../services/NftService";
import { sudtService } from "../services/SudtService";

/* The DataManager fetches new data when it's needed. This takes the burden off the other components to handle data fetches, and placing that data in appropriate stores. Other components simply tell the fetcher the relevant update, and subscribe to the incoming state via contexts :) */
export const DataManager = ({ children }) => {
  const { balanceDispatch } = useContext(BalanceContext);
  const { walletState } = useContext(WalletContext);
  const { txTrackerState, txTrackerDispatch } = useContext(TxTrackerContext);
  const { nftDispatch } = useContext(NftContext);

  const { activeAccount } = walletState;

  const fetchCkbBalance = async (activeAccount, balanceDispatch) => {
    if (activeAccount) {
      try {
        const balance = await dappService.fetchCkbBalance(
          activeAccount.lockScript
        );

        console.log("fetchCkbBalance", activeAccount, balance);

        balanceDispatch({
          type: BalanceActions.SetCkbBalance,
          lockHash: activeAccount.lockHash,
          balance,
        });
      } catch (error) {
        console.warn("fetchCkbBalance", error);
      }
    }
  };

  const fetchSudtBalance = async (sudtArgs, activeAccount, balanceDispatch) => {
    if (activeAccount) {
      try {
        const balance = await sudtService.fetchUdtBalance({
          lockScript: activeAccount.lockScript,
          sudtArgs: sudtArgs,
        });

        console.log("fetchSudtBalance", {
          sudtArgs,
          lockHash: activeAccount.lockHash,
          balance: balance.toString(),
        });

        balanceDispatch({
          type: BalanceActions.SetSudtBalance,
          lockHash: activeAccount.lockHash,
          sudtArgs: sudtArgs,
          balance,
        });
      } catch (error) {
        console.warn("fetchSudtBalance", error);
      }
    }
  };

  const fetchNfts = async (activeAccount, nftDispatch) => {
    if (activeAccount) {
      try {
        const nfts = await nftService.fetchNfts(
          activeAccount.lockScript,
          activeAccount.lockScript
        );

        nftDispatch({
          type: NftActions.SetNfts,
          ownerLockHash: activeAccount.lockHash,
          nfts: nfts,
        });
      } catch (error) {
        console.warn("fetchNfts", error);
      }
    }
  };

  // Fetch Balances on active account change
  useEffect(() => {
    if (activeAccount) {
      (async () => {
        await fetchCkbBalance(activeAccount, balanceDispatch);
        await fetchSudtBalance(
          activeAccount.lockHash,
          activeAccount,
          balanceDispatch
        ); // Fetch balance of user's own SUDT
        await fetchNfts(activeAccount, nftDispatch);
      })();
    }
  }, [activeAccount, balanceDispatch, nftDispatch]);

  // Fetch tracked transaction status + ckb balance on block update
  useInterval(async () => {
    const latestBlock = await dappService.getLatestBlock();

    if (latestBlock > txTrackerState.lastFetchedBlock) {
      console.log("latestBlock", latestBlock);
      console.log("activeAccount", activeAccount);
      txTrackerDispatch({
        type: TxTrackerActions.SetLatestBlock,
        latestBlock,
      });

      const pendingTx = getPendingTx(txTrackerState.trackedTx);

      if (pendingTx.length > 0) {
        dappService.fetchTransactionStatuses(pendingTx).then((txStatuses) => {
          txTrackerDispatch({
            type: TxTrackerActions.SetStatuses,
            txMap: txStatuses,
          });
        });
      }
      if (activeAccount) {
        await fetchCkbBalance(activeAccount, balanceDispatch);
        await fetchSudtBalance(
          activeAccount.lockHash,
          activeAccount,
          balanceDispatch
        );
        await fetchNfts(activeAccount, nftDispatch);
      }
    }
  }, 1000);

  return <React.Fragment>{children}</React.Fragment>;
};
