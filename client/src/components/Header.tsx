import React from "react";
import styled from "styled-components";
import WalletInfo from "./wallet/WalletPanel";
import { Link } from "react-router-dom";

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid black;
`;

const HeaderElement = styled.div`
  margin: 19px 30px;
  display: flex;
  min-width: 0;
  display: flex;
  align-items: center;
`;

const Title = styled.a`
  display: flex;
  text-decoration: none;
  align-items: center;
  cursor: pointer;
  height: 32px;
  img {
    font-size: 15px;
    font-weight: 500;
    height: 32px;
    width: 32px;
  }
`;

const AppName = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  letter-spacing: 1px;
  margin-left: 12px;
`;

const Header = () => {
  return (
    <HeaderFrame>
      <HeaderElement>
        <Title href="/">
          <img alt="nervos" src="nervos-logo.png" />
          <AppName>Token Playground</AppName>
        </Title>
      </HeaderElement>
      <HeaderElement>
        <Link to="/assets">Assets</Link>
      </HeaderElement>
      <HeaderElement>
        <Link to="/issue-sudt">Issue Sudt</Link>
      </HeaderElement>
      <HeaderElement>
        <Link to="/list-nfts">NFTs</Link>
      </HeaderElement>
      <HeaderElement>
        <Link to="/generate-nft">Generate NFT</Link>
      </HeaderElement>
      <HeaderElement>
        <Link to="/token-sale">Token Sale</Link>
      </HeaderElement>
      <HeaderElement>
        <WalletInfo />
      </HeaderElement>
    </HeaderFrame>
  );
};

export default Header;
