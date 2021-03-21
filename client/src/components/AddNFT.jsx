import React, {Component} from 'react';
import Button from 'react-bootstrap-button-loader';

export default class AddNFT extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {updateNFT, handleNFTSubmit, newNFT, error, inProgress, history} = this.props;
    return (
      <div className="new-nft">
        <div className="col-md-8">
          <br/>
          <p className="h3">Add NFT</p>
          <br/>
          <input type="text" className="form-control"
                 value={newNFT.contractAddress}
                 onChange={e => updateNFT('contractAddress', e.target.value)}
                 placeholder="contractAddress" required={true}
          />
          <br/>
          <input type="text" className="form-control"
                 value={newNFT.tokenID}
                 onChange={e => updateNFT('tokenID', e.target.value)}
                 placeholder="tokenID" required={true}
          />
          <br/>
        </div>
        <div className="col-md-12">
          <Button variant="secondary"
            onClick={e => handleNFTSubmit(e, this.props.history)}
            loading={inProgress}
          >
            Add
          </Button>
          <Button variant="secondary" onClick={() => { history.push('/') }} style={{marginLeft: "10px"}}>
            Go back
          </Button>
          <br/>
          <br/>
          {error && <div>Error: {error}</div>}
        </div>

      </div>
    )
  }
}
