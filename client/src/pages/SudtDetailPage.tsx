import React, { useContext, useEffect, useState } from "react";
import { Grid } from "../components/common/Grid";
import { NftContext } from "../stores/NftStore";

export const SudtDetailPage = ({ match }) => {
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);

  return (
    <Grid>
      {loading && <p>Loading...</p>}
      {!loading && !exists && <p>Can't find an SUDT with lockHash of current user</p>}
    </Grid>
  );
};
