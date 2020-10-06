import React from "react";
import { HashRouter, Redirect, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import "./App.css";
import Header from "./components/Header";
import WalletModal from "./components/modals/WalletModal";
import * as dotenv from "dotenv";
import { ModalStore } from "./stores/ModalStore";
import { BalanceStore } from "./stores/BalanceStore";
import { WalletStore } from "./stores/WalletStore";
import { NftDetailPage } from "./pages/NftDetailPage";
import { NftGeneratePage } from "./pages/NftGeneratePage";
import { NftListPage } from "./pages/NftListPage";
import { DataManager } from "./components/DataManager";
import { TxTrackerStore } from "./stores/TxTrackerStore";
import { NftStore } from "./stores/NftStore";
import { SudtIssuePage } from "./pages/SudtIssuePage";
import { AssetListPage } from "./pages/AssetListPage";
import { SudtDetailPage } from "./pages/SudtDetailPage";
import TransferModal from "./components/modals/TransferModal";

dotenv.config();

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const ContentWrapper = styled.div`
  margin: 0 auto;
`;

function App() {
  return (
    <BalanceStore>
      <WalletStore>
        <ModalStore>
          <TxTrackerStore>
            <NftStore>
              <DataManager>
                <div className="App">
                  <div className="app-shell">
                    <HashRouter>
                      <Header />
                      <WalletModal />
                      <TransferModal />
                      <Container>
                        <ContentWrapper>
                          <Switch>
                            <Route path="/list-nfts" component={NftListPage} />
                            <Route
                              path="/generate-nft"
                              component={NftGeneratePage}
                            />
                            <Route path="/nft/:id" component={NftDetailPage} />
                            <Route
                              path="/issue-sudt"
                              component={SudtIssuePage}
                            />
                            <Route path="/assets/" component={AssetListPage} />
                            <Route
                              path="/asset/:id"
                              component={SudtDetailPage}
                            />
                            <Redirect from="/" to="/hello-ckb" />
                          </Switch>
                        </ContentWrapper>
                      </Container>
                    </HashRouter>
                  </div>
                </div>
              </DataManager>
            </NftStore>
          </TxTrackerStore>
        </ModalStore>
      </WalletStore>
    </BalanceStore>
  );
}

export default App;
