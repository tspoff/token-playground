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
import { TokenSaleActions, TokenSaleContext } from "../stores/TokenSaleStore";
import { tokenSaleService } from "../services/TokenSaleService";
import { computeScriptHash } from "../utils/scriptUtils";
import { Account } from "../utils/Account";

/* The DataManager fetches new data when it's needed. This takes the burden off the other components to handle data fetches, and placing that data in appropriate stores. Other components simply tell the fetcher the relevant update, and subscribe to the incoming state via contexts :) */
export const DataManager = ({ children }) => {
  const { balanceDispatch } = useContext(BalanceContext);
  const { tokenSaleDispatch } = useContext(TokenSaleContext);
  const { walletState } = useContext(WalletContext);
  const { txTrackerState, txTrackerDispatch } = useContext(TxTrackerContext);
  const { nftDispatch } = useContext(NftContext);

  const { activeAccount } = walletState;

  const fetchCkbBalance = async (activeAccount: Account, balanceDispatch) => {
    if (activeAccount) {
      try {
        const balance = await dappService.fetchCkbBalance(
          activeAccount.lockScript
        );

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

  /**
   * Fetch token sale cells and store them to data
   * @param forAccount Account to fetch cells for
   * @param tokenSaleDispatch Dispatcher for token sale store 
   */
  const fetchTokenSaleCells = async (activeAccount, tokenSaleDispatch) => {
    if (activeAccount) {
      try {
        const cellData = await tokenSaleService.fetchTokenSaleCells(
          activeAccount.lockScript
        );

        tokenSaleDispatch({
          type: TokenSaleActions.SetTokenSaleCells,
          sudtArgs: computeScriptHash(activeAccount.lockScript),
          cells: cellData.cells,
          metadata: cellData.metadata
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

        // console.log("fetchSudtBalance", {
        //   sudtArgs,
        //   lockHash: activeAccount.lockHash,
        //   balance: balance.toString(),
        // });

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

  const fetchNfts = async (activeAccount: Account, nftDispatch) => {
    if (activeAccount) {
      try {
        const nfts = await nftService.fetchNftsByGovernanceLock(
          activeAccount.lockScript
        );

        console.log('fetchedNFTs', nfts);

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

  /**
   * Fetch user-specific data on active account change
   */
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
        await fetchTokenSaleCells(activeAccount, tokenSaleDispatch);
      })();
    }
  }, [activeAccount, balanceDispatch, nftDispatch, tokenSaleDispatch]);

  /**
   * Fetch tracked transaction status + ckb balance on block update
   */
  useInterval(async () => {
    const latestBlock = await dappService.getLatestBlock();

    if (latestBlock > txTrackerState.lastFetchedBlock) {
      txTrackerDispatch({
        type: TxTrackerActions.SetLatestBlock,
        latestBlock,
      });

      const pendingTx = getPendingTx(txTrackerState.trackedTx);

      console.log(pendingTx);

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
        await fetchTokenSaleCells(activeAccount, tokenSaleDispatch);
      }
    }
  }, 1000);

  return <React.Fragment>{children}</React.Fragment>;
};
