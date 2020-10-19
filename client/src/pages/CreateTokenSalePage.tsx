import React, { useContext } from "react";
import { Grid } from "../components/common/Grid";
import CreateTokenSaleForm from "../components/token-sale/CreateTokenSaleForm";

export const CreateTokenSalePage = () => {
  return (
    <Grid>
      <h1>Create</h1>
      <CreateTokenSaleForm />
    </Grid>
  );
};
