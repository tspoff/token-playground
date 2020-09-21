import React, { useContext } from "react";
import { Cell } from "@ckb-lumos/base";
import { WalletContext } from "../stores/WalletStore";
import { Grid } from "../components/common/Grid";
import { NftList } from "../components/NftList";
import { NftContext, NftMap } from "../stores/NftStore";
import GenerateNftForm from "../components/GenerateNftForm";

export const NftGeneratePage = () => {
  const { nftState } = useContext(NftContext);
  const { walletState } = useContext(WalletContext);
  const state = useContext(NftContext);

  console.log(nftState, state);

  let nftsToDisplay: NftMap = {};
  if (walletState.activeAccount?.lockHash === nftState.ownerLockHash) {
    nftsToDisplay = nftState.nfts;
  }

  return (
    <Grid>
      <h1>Generate NFT</h1>
      <GenerateNftForm />
    </Grid>
  );
};
