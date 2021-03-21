import React, {Component} from 'react';
import {Modal, FormControl, ListGroup} from 'react-bootstrap';
import Button from 'react-bootstrap-button-loader';
import {FaArrowUp, FaArrowDown, FaListAlt} from 'react-icons/fa';
import {abi, address} from "./contract";

class ListNFT extends Component {
  constructor(props) {
    super(props);
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.state = {
      show: false,
      comments: [],
      nftId: '',
      commentText: '',
      inProgress: false,
    };
  }

  handleClose() {
    this.setState({show: false, nftId: '', commentText: '', comments: []});
  }

  async handleShow(event, nftId) {
    this.setState({show: true, nftId: nftId});
    await this.fetchNFTComments(nftId);
  }

  async fetchNFTComments(nftId) {
    const NFTHunt = new this.props.web3.eth.Contract(abi, address);
    const nftCommentCount = await NFTHunt.methods.getNFTCommentCount(nftId).call();
    let comments = [];
    for (let i = 0; i < nftCommentCount; i++) {
      const comment = await NFTHunt.methods.getNFTComment(nftId, i).call();
      comments.push({id: comment[0], upVotes: comment[1], downVotes: comment[2], text: comment[3]})
    }
    comments.reverse();
    this.setState({comments: comments, account: this.props.account});
  }

  async submitNFTComment(event) {
    this.setState({
      inProgress: true
    });
    const NFTHunt = new this.props.web3.eth.Contract(abi, address);
    await NFTHunt.methods.addNFTComment(this.state.nftId, this.state.commentText).send({from: this.props.account});
    this.setState({
      commentText: '',
      inProgress: false
    });
    await this.fetchNFTComments(this.state.nftId);
  }

  updateNFTComment(value) {
    this.setState({
      commentText: value
    });
  }

  async upVoteNFTComment(e, commentId) {
    const NFTHunt = new this.props.web3.eth.Contract(abi, address);
    await NFTHunt.methods.upVoteNFTComment(this.state.nftId, commentId).send({from: this.props.account});
    await this.fetchNFTComments(this.state.nftId);
  }

  async downVoteNFTComment(e, commentId) {
    const NFTHunt = new this.props.web3.eth.Contract(abi, address);
    await NFTHunt.methods.downVoteNFTComment(this.state.nftId, commentId).send({from: this.props.account});
    await this.fetchNFTComments(this.state.nftId);
  }

  render() {
    const {isLoading, nft, upVoteNFT, downVoteNFT, history} = this.props;
    const {show, comments, commentText} = this.state;
    return (
      <div className="col-md-12 nft">
        <br/>
        <Button variant="secondary" onClick={() => { history.push('/add_nft') }} style={{marginBottom: "10px"}}>
          Hunt
        </Button>
        <br/>
        {isLoading && <span>Fetching NFT...</span>}
        <div>
          {nft.map((n) => (

              <div key={n.id} style={{border: "1px solid #1e1e1e", padding:"20px", borderRadius: "15px",
                }}>
                <div>
                  <nft-card
                    tokenAddress={n.contractAddress}
                    tokenId={n.tokenID}
                    network="mainnet"
                    referrerAddress="YOUR_ADDRESS_HERE"
                  >
                  </nft-card>
                  <div style={{float: 'right', margin: "5px"}}>
                    <FaArrowUp onClick={e => upVoteNFT(e, n.id)} style={{cursor: 'pointer'}}/>{n.upVotes}
                    <br/>
                    <FaArrowDown onClick={e => downVoteNFT(e, n.id)} style={{cursor: 'pointer'}}/>{n.downVotes}
                  </div>
                  <br/>
                  <FaListAlt onClick={e => this.handleShow(e, n.id)} style={{cursor: 'pointer'}}/>
                </div>
              </div>
            )
          )}
        </div>
        {!isLoading && !nft.length && <span>Add a NFT to get started</span>}
        <br/>
        <Modal show={show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Comments</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{maxHeight: 'calc(100vh - 210px)', overflowY: 'auto'}}>
            <FormControl as="textarea" aria-label="With textarea" value={commentText}
                         onChange={e => this.updateNFTComment(e.target.value)}/>
            <br/>
            <Button variant="secondary" onClick={e => this.submitNFTComment(e)} loading={this.state.inProgress}>
              Add Comment
            </Button>
            <br/>
            <br/>
            <ListGroup>
              {comments.map((comment) => (
                  <ListGroup.Item key={comment.id}>
                    {comment.text}
                    <br/>
                    <div>
                      <FaArrowUp onClick={e => this.upVoteNFTComment(e, comment.id)}
                                 style={{cursor: 'pointer'}}/>{comment.upVotes}
                      <br/>
                      <FaArrowDown onClick={e => this.downVoteNFTComment(e, comment.id)}
                                   style={{cursor: 'pointer'}}/>{comment.downVotes}
                    </div>
                  </ListGroup.Item>
                )
              )}
            </ListGroup>
          </Modal.Body>
          <Modal.Footer>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }

}

export default ListNFT;
