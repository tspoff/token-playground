import React, { useContext } from "react";
import { WalletContext } from "../stores/WalletStore";
import { Grid } from "../components/common/Grid";
import { AssetTransferList, AssetData } from "../components/asset-list/AssetTransferList";
import { BalanceContext, getAssetBalancesForAddress } from "../stores/BalanceStore";

export const AssetListPage = () => {
  const { balanceState } = useContext(BalanceContext);
  const { walletState } = useContext(WalletContext);

  let assetsToDisplay = [] as AssetData[];

  if (walletState.activeAccount?.lockHash) {
    assetsToDisplay = getAssetBalancesForAddress(balanceState, walletState.activeAccount.lockHash);
  }

  return (
    <Grid>
      <h1>Assets</h1>
      <AssetTransferList assets={assetsToDisplay} />
    </Grid>
  );
};
