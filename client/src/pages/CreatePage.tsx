import React, { useContext } from "react";
import { WalletContext } from "../stores/WalletStore";
import { Grid } from "../components/common/Grid";
import { Link } from "react-router-dom";
import ActionButton from "../components/common/ActionButton";

export const CreatePage = () => {
  return (
    <Grid>
      <h1>Create</h1>
      <ActionButton>
        <Link to="/issue-sudt">Issue Sudt</Link>
      </ActionButton>
      <ActionButton>
        <Link to="/generate-nft">Generate NFT</Link>
      </ActionButton>
      <ActionButton>
        <Link to="create-token-sale">Create Token Sale</Link>
      </ActionButton>
    </Grid>
  );
};
