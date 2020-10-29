import React from "react";
import styled from "styled-components";
import { Hash } from "@ckb-lumos/base";
import { AssetMetadata } from "../../stores/assets";
import { AssetTableRow } from "./AssetTableRow";
import { TokenSaleCellRow } from "./TokenSaleCellRow";
import { ckbHash } from "../../utils/ckbUtils";
import { TokenSaleCells } from "../../stores/TokenSaleStore";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  border-radius: 5px;
`;

interface Props {
  cells: TokenSaleCells;
}

export const TokenSaleCellList = (props: Props) => {
  const { cells } = props;

  const renderListItems = () => {
    return cells.parsed.map((cellMetadata, index) => {
      return <TokenSaleCellRow key={index} data={cellMetadata} />;
    });
  };

  return (
    <Wrapper>
      {cells.parsed.length > 0 && (
        <table>
          <tbody>
          <tr>
            <th>Ckb Amount</th>
            <th>Udt Amount</th>
            <th>Shannons per Token</th>
          </tr>
          {renderListItems()}
          </tbody>
        </table>
      )}
      {cells.parsed.length === 0 && "No token sale cells found for active account"}
    </Wrapper>
  );
};
