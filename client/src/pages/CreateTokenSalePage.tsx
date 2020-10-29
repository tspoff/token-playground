import React, { useContext } from "react";
import { Grid } from "../components/common/Grid";
import CreateTokenSaleForm from "../components/token-sale/CreateTokenSaleForm";
import { TokenSaleCellList } from "../components/token-sale/TokenSaleCellList";
import { TokenSaleCellData, tokenSaleService } from "../services/TokenSaleService";
import { getTokenSaleCellsForSudtArgs, TokenSaleCells, TokenSaleContext } from "../stores/TokenSaleStore";
import { WalletContext } from "../stores/WalletStore";

export const CreateTokenSalePage = () => {
  const { walletState } = useContext(WalletContext);
  const { tokenSaleState } = useContext(TokenSaleContext);

  console.log('tokenSaleState', tokenSaleState);

  let cells: TokenSaleCells | undefined = undefined;

  if (walletState.activeAccount) {
    cells = getTokenSaleCellsForSudtArgs(tokenSaleState, walletState.activeAccount?.lockHash)
  }

  return (
    <Grid>
      <h1>Create</h1>
      { walletState.activeAccount &&
        <CreateTokenSaleForm sudtArgs={walletState.activeAccount?.lockHash}/>
      }
      {cells &&
        <TokenSaleCellList cells = {cells} />
      }
    </Grid>
  );
};
