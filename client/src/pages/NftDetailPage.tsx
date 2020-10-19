import React, { useContext, useEffect, useState } from "react";
import { Cell } from "@ckb-lumos/base";
import { WalletContext } from "../stores/WalletStore";
import { Grid } from "../components/common/Grid";
import { NftContext } from "../stores/NftStore";
import { NftCardDetailed } from "../components/nft/NftCardDetailed";
import { nftService } from "../services/NftService";

export const NftDetailPage = ({ match }) => {
  const { nftState, nftDispatch } = useContext(NftContext);
  const { walletState } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);
  const [nft, setNft] = useState({} as Cell);

  const acccountAccount = walletState.activeAccount;

  const nftId = match.params.id;

  useEffect(() => {
    (async () => {
      let result;

      if (acccountAccount) {
        result = await nftService.fetchNftById(
          acccountAccount?.lockScript,
          nftId
        );
      }

      if (result) {
        setNft(result);
        setExists(true);
      }
      setLoading(false);
    })();
  }, [nftId, nftDispatch, acccountAccount]);

  return (
    <Grid>
      {loading && <p>Loading...</p>}
      {!loading && !exists && <p>Can't find an NFT with ID {nftId} with governance lock of current account 🤔</p>}
      {!loading && exists && <NftCardDetailed nftCell={nft} />}
    </Grid>
  );
};
