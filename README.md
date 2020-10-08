# Token Playground
Dapp to Mint and Transfer both fungible and non-fungible assets.
Based on the [Hello Lumos](https://github.com/tspoff/hello-lumos) dapp template.

## Install
1. Run `yarn install` in the root directory to install dependencies for both server & client.
___
## Configure
The client and server both need some env variables set to get started.

#### Client Config:
1. Navigate to the /client folder & copy `.env.example` -> `.env` 

2. Replace `REACT_APP_PRIVATE_KEY` with a private key of choice for using the in-memory wallet.

> ⚠️ This wallet is not secure, never use this key on mainnet or to otherwise secure any assets with value!

#### Server Config:
1. Navigate to the /server folder & copy `.env.example` -> `.env`. (It's not necessary to change any values, unless you want to connect to a CKB node at a different URI).
___
## Run
Ensure a local CKB node connected to Aggron4 testnet ([guide here](https://docs.nervos.org/docs/basics/guides/testnet)) is running at the URI specified in the server `.env` config.

1. Start server: 

    `yarn start` from /server folder

2. In a separate terminal, start client: 
    
    `yarn start` from /client folder

### Getting funds for your test wallet.
Navigate to `localhost:3000` and check out your app. You'll see the address of your private key, but we'll need some funds in order to test the CKB transfer.

1. Click the wallet navbar to open up the wallet interface

2. Click the 'copy' modal to copy your address

3. Take that address to the [CKB Testnet Faucet](https://faucet.nervos.org/) & claim some testnet CKB

4. Once the transaction is processed, come back & refresh to see your new balance!