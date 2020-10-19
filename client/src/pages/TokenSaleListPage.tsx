import React, { useContext } from "react";
import { WalletContext } from "../stores/WalletStore";
import { Grid } from "../components/common/Grid";
import { NftList } from "../components/nft/NftList";
import { NftContext, NftMap } from "../stores/NftStore";

export const TokenSaleListPage = () => {
  return (
    <Grid>
      <h1>Token Sales</h1>
    </Grid>
  );
};
