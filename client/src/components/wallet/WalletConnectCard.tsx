import React from "react";
import styled from "styled-components";
import ActionButton from "../common/ActionButton";

const Wrapper = styled.div`
  border: 1px solid black;
  width: 250px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Image = styled.img`
  max-width: 100px;
  max-height: 100px;
  margin: auto;
  padding: 10px;
`;

interface Props {
  name: string;
  onClick: any;
  logo: string;
  alt: string;
}

export const WalletConnectCard = (props: Props) => {
  const { name, onClick, logo, alt } = props;
  return (
    <Wrapper>
      <Image src={logo} alt={alt} />
      <p>{name}</p>
      <ActionButton onClick={onClick}>Connect</ActionButton>
    </Wrapper>
  );
};
