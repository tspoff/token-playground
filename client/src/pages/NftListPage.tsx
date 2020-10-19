import React, { useContext } from "react";
import { Cell } from "@ckb-lumos/base";
import { WalletContext } from "../stores/WalletStore";
import { Grid } from "../components/common/Grid";
import { NftList } from "../components/nft/NftList";
import { NftContext, NftMap } from "../stores/NftStore";

export const NftListPage = () => {
  const { nftState } = useContext(NftContext);
  const { walletState } = useContext(WalletContext);
  const state = useContext(NftContext);

  let ownedNfts: NftMap = {};
  console.log('NftListPage: ownedNfts', ownedNfts);
  if (walletState.activeAccount?.lockHash === nftState.ownerLockHash) {
    ownedNfts = nftState.nfts;
  }

  let governedNfts: NftMap = {};
  if (walletState.activeAccount?.lockHash === nftState.ownerLockHash) {
    governedNfts = nftState.nfts;
  }

  return (
    <Grid>
      <h1>Your Owned NFTs</h1>
      <p>(Only shows NFTs with the governance lock of the active account)</p>
      <NftList nfts={ownedNfts} />
      <h1>Your Governed NFTs</h1>
      <NftList nfts={governedNfts} />
    </Grid>
  );
};
