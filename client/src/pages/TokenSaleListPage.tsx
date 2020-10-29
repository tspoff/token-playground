import React, { useContext, useEffect } from "react";
import { WalletContext } from "../stores/WalletStore";
import { Grid, Row } from "../components/common/Grid";
import { NftList } from "../components/nft/NftList";
import { NftContext, NftMap } from "../stores/NftStore";
import { useHistory } from "react-router-dom";
import { BalanceContext } from "../stores/BalanceStore";
import {
  getTokenSaleCellsForSudtArgs,
  TokenSaleActions,
  TokenSaleContext,
} from "../stores/TokenSaleStore";
import { TxTrackerContext } from "../stores/TxTrackerStore";
import { tokenSaleService } from "../services/TokenSaleService";
import { valuesIn } from "lodash";
import { TokenSaleCellList } from "../components/token-sale/TokenSaleCellList";
import BuyTokenSaleForm from "../components/token-sale/BuyTokenSaleForm";

// Search bar (renavigates to correct place)
// List cells of connected amounts
export const TokenSaleListPage = ({ match }) => {
  const { tokenSaleState, tokenSaleDispatch } = useContext(TokenSaleContext);
  const { walletState } = useContext(WalletContext);

  const { activeAccount } = walletState;

  let sudtArgs = match.params.id;

  if (match.params.id === "user" && !!walletState.activeAccount) {
    sudtArgs = walletState.activeAccount.lockHash;
  }

  console.log("sudtArgs", sudtArgs);

  console.log("tokenSaleState", tokenSaleState);

  let cells: TokenSaleCells | undefined = undefined;
  cells = getTokenSaleCellsForSudtArgs(tokenSaleState, sudtArgs);

  /**
   * Fetch token sale cells and store them to data
   * @param forAccount Account to fetch cells for
   * @param tokenSaleDispatch Dispatcher for token sale store
   */
  const fetchTokenSaleCells = async (
    activeAccount,
    tokenSaleDispatch,
    sudtArgs
  ) => {
    if (activeAccount) {
      try {
        const cellData = await tokenSaleService.fetchTokenSaleCellsByArgs(
          sudtArgs
        );

        tokenSaleDispatch({
          type: TokenSaleActions.SetTokenSaleCells,
          sudtArgs: sudtArgs,
          cells: cellData.cells,
          metadata: cellData.metadata,
        });
      } catch (error) {
        console.warn("fetchCkbBalance", error);
      }
    }
  };

  /**
   * Fetch token sale cells for user
   */
  useEffect(() => {
    if (activeAccount) {
      (async () => {
        await fetchTokenSaleCells(activeAccount, tokenSaleDispatch, sudtArgs);
      })();
    }
  }, [activeAccount, tokenSaleDispatch, sudtArgs]);

  return (
    <Grid>
      <Row>
        <h1>Token Sales</h1>
      </Row>
      <Row>
        {
          cells &&
          <BuyTokenSaleForm udtTypeHash={sudtArgs} cells={cells} />
        }
      </Row>
    </Grid>
  );
};
