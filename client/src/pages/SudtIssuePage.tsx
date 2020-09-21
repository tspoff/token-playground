import React, { useContext } from "react";
import { WalletContext } from "../stores/WalletStore";
import { Grid } from "../components/common/Grid";
import { NftContext } from "../stores/NftStore";
import IssueSudtForm from "../components/sudt/IssueSudtForm";

export const SudtIssuePage = () => {
  const { nftState } = useContext(NftContext);
  const { walletState } = useContext(WalletContext);
  const state = useContext(NftContext);

  return (
    <Grid>
      <h1>Issue Sudt</h1>
      <IssueSudtForm />
    </Grid>
  );
};
