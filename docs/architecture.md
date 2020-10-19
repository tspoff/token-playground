# Token Playground Architecture

Token playground is based on the [hello-lumos](https://github.com/tspoff/hello-lumos) Typescript + React Dapp template.

It follows the patterns prescribed there to:
- Query data from the blockchain.
- Interact with CKB wallets ([Synapse](https://github.com/rebase-network/synapse-extension/) is supported out of the box).
- Build, sign, send, and track transactions.

See the [Video Walkthrough](https://www.youtube.com/watch?v=9U23hrzCAiM) for an overview of the architecture and code walkthrough of the template.

### Looking to learn more about Lumos?

Check out the [docs](https://github.com/nervosnetwork/lumos), the intro [tutorial](https://docs.nervos.org/docs/labs/lumos-nervosdao), as well as the third entry in the [Dapps on CKB video workshop](https://www.youtube.com/watch?v=TJ2bnSFUpPQ).

# The Components

## Client

The client serves as the point of interaction for users. It handles queries and transactions for the blockchain via the dApp server, and gets required signatures for transactions from the Wallet.

#### Component Interactions

![Component Interactions](./images/interactions.png)

### The Stack

As per hello-lumos, The client is based on the [create-react-app](https://create-react-app.dev/docs/getting-started/) typescript template. [Styled-components](https://styled-components.com/) is used for the bulk of styling. [React-hook-form](https://react-hook-form.com/) is used for a clean, lightweight form handler. State managment is handled in a lightweight fashion using hooks.

There are a set of **Stores** that maintain application-level state. They make use of the useContext() react hook to allow usage anywhere in the application.

* Store user CKB and sUDT balances
* Store user NFTs
* Maintain a local copy of metadata for sUDTs (will be moved to a common library in the future)
* Track users' active transactions
* Maintain the state of the active wallet

The **Services** manage interaction with other components, such as the dApp server and wallet. 

The dApp server is interacted with via standard REST API calls, which are handled in sub-services for each set of functionality.
* **Dapp service** (for general rpc calls & CKB transfers)
* **NFT service** (for NFT-related calls)
* **sUDT service** (for sUDT-related calls)
* **sUDT sale** service (for token sales)

There is a standard Wallet interface which abstracts away the particulars of the connected wallet from the rest of the application, allowing it to support a multitude of wallets.

---
## Server

The server is essentially a wrapper around the Lumos indexer & transaction generation functionality. 

It features a simple REST API for the queries and actions required by the client.

- **General** routes for querying the node directly, without having to maintain it's own connection.
- **Indexer** routes for core indexer functions (querying for cells and transactions).
- **Ckb** routes for handling ckb balances and transfers.
- **Sudt** routes for handling sUDT minting, balances, and transfers.
- **Nft** routes for handling NFT reading, minting, and transfers.
- **Sudt Sale** routes for handling token sales.

## A note on numbers

Numerical values are stored as `BigInt` form for comparison, because numbers in the CKB system can exceed the maximum value that can be safely stored in Javascript numbers. These are converted to strings when required (passing via API, serialization, display). Certain formatter methods use `bignumber.js` for its' convenient formatting options.

## A note on CKB transfers

The minimum transfer amount is 61 CKBytes (6100000000 Shannons). This is because enough CKBytes must be provided such that a new cell can be created for the recipient. Attempting to transfer less than this amount will result in a "Transaction: InsufficientCellCapacity" error.
