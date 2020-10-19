import React from "react";
import { formatBalance } from "../../utils/formatters";

interface Props {
  amount: string | undefined;
  showPlaceholder?: boolean;
  decimals?: bigint;
}

const CkbValue = (props: Props) => {
  if (props.showPlaceholder) {
    return <React.Fragment>-</React.Fragment>;
  } else if (props.amount) {
    return (
      <React.Fragment>
        {formatBalance(props.amount.toString(), props.decimals ? Number(props.decimals) : 8)}
      </React.Fragment>
    );
  } else {
    throw new Error(
      "CkbValue component requires either a valid amount or the showPlaceholder flag"
    );
  }
};

export default CkbValue;
