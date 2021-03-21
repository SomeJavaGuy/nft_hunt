import React, {Component} from 'react';

import {Route, BrowserRouter} from 'react-router-dom';
import {Navbar, Image} from 'react-bootstrap';
import Button from 'react-bootstrap-button-loader';

import AddNFT from './AddNFT.jsx';
import ListNFT from './ListNFT.jsx';
import {abi, address} from "./contract";
const Web3 = require('web3');
import Web3Modal from "web3modal";

export default class Main extends Component {

  constructor(props) {
    super(props);
    this.state = {
      newNFT: {
        tokenID: '',
        contractAddress: ''
      },
      isLoading: false,
      error: '',
      nft: [],
      account: '',
      inProgress: false,
      web3: ''
    };
  }

  web3Modal = new Web3Modal({
    network: "mumbai", // optional
    cacheProvider: true, // optional
    providerOptions: {}
  });

  async login() {
    const provider = await this.web3Modal.connect();
    await this.subscribeProvider(provider);
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];
    const networkId = await web3.eth.net.getId();
    if (networkId !== 80001) {
      alert('App works only for Matic Mumbai testnet');
      return;
    }
    this.setState({
      web3: web3,
      account: address
    });
    await this.fetchNFT();
  }

  async logout() {
    this.resetApp();
  }

  async subscribeProvider(provider) {
    if (!provider.on) {
      return;
    }
    provider.on("close", () => this.resetApp());
    provider.on("accountsChanged", async (accounts) => {
      await this.setState({account: accounts[0]});
      await this.fetchNFT();
    });
    provider.on("chainChanged", async (chainId) => {
      const {web3} = this.state;
      const networkId = await web3.eth.net.getId();
      if (networkId !== 80001) {
        alert('App works only for Matic Mumbai testnet');
        return;
      }
      await this.fetchNFT();
    });

    provider.on("networkChanged", async (networkId) => {
      if (networkId !== 80001) {
        alert('App works only for Matic Mumbai testnet');
        return;
      }
      await this.fetchNFT();
    });
  };

  async resetApp() {
    const {web3} = this.state;
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await this.web3Modal.clearCachedProvider();
    this.setState({account: '', web3: ''});
  };

  updateNFT(key, value) {
    const nft = this.state.newNFT;
    nft[key] = value;
    this.setState({
      newNFT: nft
    })
  }


  async handleNFTSubmit(event, history) {
    let newNFT = this.state.newNFT;
    let contractAddress_regex = /^(0x){1}[0-9a-fA-F]{40}$/g;
    if (typeof newNFT.tokenID === "undefined" || newNFT.tokenID.trim() === "" || isNaN(newNFT.tokenID)) {
      this.setState({error: "Valid tokenID is required"});
      return;
    }
    if (typeof newNFT.contractAddress === "undefined" || newNFT.contractAddress.trim() === "" || !newNFT.contractAddress.match(contractAddress_regex)) {
      this.setState({error: "Valid contractAddress is required"});
      return;
    }
    this.setState({error: '', inProgress: true});
    await this.saveNewNFT(newNFT);
    this.setState({
      newNFT: {
        tokenID: '',
        contractAddress: ''
      },
      inProgress: false
    });
    history.push('/');
    await this.fetchNFT();
  }

  async saveNewNFT(newNFT) {
    const NFTHunt = new this.state.web3.eth.Contract(abi, address);
    await NFTHunt.methods.addNFT(newNFT.contractAddress, newNFT.tokenID).send({from: this.state.account});
  }

  async upVoteNFT(e, nftId) {
    const NFTHunt = new this.state.web3.eth.Contract(abi, address);
    await NFTHunt.methods.upVoteNFT(nftId).send({from: this.state.account});
    await this.fetchNFT();
  }

  async downVoteNFT(e, nftId) {
    const NFTHunt = new this.state.web3.eth.Contract(abi, address);
    await NFTHunt.methods.downVoteNFT(nftId).send({from: this.state.account});
    await this.fetchNFT();
  }

  render() {
    const {nft, isLoading, error, inProgress} = this.state;
    return (
      <BrowserRouter>
        <Route render={({location, history}) => (
          <React.Fragment>
            <div className="site-sub-wrapper">
              <Navbar bg="nav" variant="light">
                <div style={{width: "90%"}}>
                  <Navbar.Brand style={{marginLeft: '0px'}}><b>NFT Hunt</b></Navbar.Brand>
                </div>
                {!this.state.account &&
                <Button variant="default btn-sm" onClick={this.login.bind(this)} style={{float: "right", border: "1px solid black"}}>
                  Connect
                </Button>
                }
                {this.state.account &&
                <Button variant="default btn-sm" onClick={this.logout.bind(this)} style={{float: "right", border: "1px solid black"}}>
                  Logout
                </Button>
                }
              </Navbar>
              <main>
                { this.state.account &&
                  <div>
                    <Route path="/" exact render={props => <ListNFT
                      isLoading={isLoading} nft={nft} upVoteNFT={this.upVoteNFT.bind(this)}
                      downVoteNFT={this.downVoteNFT.bind(this)} history={history} web3={this.state.web3}
                      account={this.state.account}
                    />}/>
                    <Route path="/add_nft" render={props => <AddNFT
                      updateNFT={this.updateNFT.bind(this)}
                      handleNFTSubmit={this.handleNFTSubmit.bind(this)}
                      inProgress={inProgress}
                      newNFT={this.state.newNFT} history={history} error={error}/>}/>
                  </div>
                }

                {! this.state.account &&
                <div className="panel-landing  h-100 d-flex" id="section-1">
                  <div className="container row" style={{marginTop: "50px"}}>
                    <div className="col l8 m12">

                      <p className="h4">
                        Hunt your favorite NFTs and discuss about them
                      </p>
                      <Image src="/nft_hunt.jpg"
                             style={{height: "400px", width: "800px", marginTop: "10px"}} fluid/>
                    </div>
                  </div>
                </div>
                }
              </main>
            </div>
          </React.Fragment>
        )}
        />
      </BrowserRouter>
    );
  }

  async fetchNFT() {
    this.setState({isLoading: true});
    try {
      const NFTHunt = new this.state.web3.eth.Contract(abi, address);
      const count = await NFTHunt.methods.getNFTCount().call();
      let nft = [];
      for (let i = 0; i < count; i++) {
        const n = await NFTHunt.methods.getNFT(i).call();
        nft.push({
          id: n[0], upVotes: n[1], downVotes: n[2], contractAddress: n[3], tokenID: n[4]
        });
      }
      nft.reverse();
      this.setState({nft: nft, isLoading: false});
    } catch(e){
      console.log(e);
      this.setState({isLoading: false});
    }

  }

  async componentWillMount() {
    if (this.web3Modal.cachedProvider) {
      this.login();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    //console.log(prevState, this.state);
  }

}
