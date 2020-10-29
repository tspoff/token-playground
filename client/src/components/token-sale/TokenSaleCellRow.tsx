import React from "react";
import { TokenSaleCellParsedData } from "../../stores/TokenSaleStore";
import CkbValue from "../common/CkbValue";

interface Props {
  data: TokenSaleCellParsedData;
}

export const TokenSaleCellRow = (props: Props) => {
  console.log('TokenSaleCellRow', props);
  const { ckbAmount, sudtAmount, shannonsPerToken } = props.data;
  return (
    <tr>
      <td>
        <CkbValue amount={ckbAmount} showPlaceholder={!ckbAmount} />
      </td>
      <td>
        <CkbValue amount={sudtAmount} showPlaceholder={!sudtAmount} />
      </td>
      <td>
        <CkbValue
          amount={shannonsPerToken}
          showPlaceholder={!shannonsPerToken}
        />
      </td>
    </tr>
  );
};
