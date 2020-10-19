import React from "react";
import { Grid } from "../components/common/Grid";

export const TokenSaleListPage = ({ match }) => {
  const udtTypeHash = match.params.id;

  return (
    <Grid>
      <h1>Buy UDT</h1>
      <p>Available</p>
    </Grid>
  );
};
