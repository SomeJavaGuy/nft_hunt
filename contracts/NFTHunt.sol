pragma solidity ^0.5.0;

contract NFTHunt {

    struct NFT{
        uint id;
        address user;
        uint upVotes;
        uint downVotes;
        string contractAddress;
        string tokenID;
        Comment[] comments;
    }

    struct Comment{
        uint id;
        address user;
        uint upVotes;
        uint downVotes;
        string text;
    }

    enum VoteType{notVoted, upVote, downVote}

    struct NFTVotes{
        mapping(uint => VoteType) nftVote;
    }

    mapping(address => NFTVotes) private nftVotesMapping;

    struct NFTCommentVotes{
        mapping(uint => VoteType) nftCommentVote;
    }

    mapping(address =>  mapping(uint => NFTCommentVotes)) private nftCommentVotesMapping;

    NFT[] private nft;

    function addNFT(string memory contractAddress, string memory tokenID) public {
        nft.length++;
        NFT storage n = nft[nft.length - 1];
        n.id = nft.length - 1;
        n.user = msg.sender;
        n.upVotes = 0;
        n.downVotes = 0;
        n.contractAddress = contractAddress;
        n.tokenID = tokenID;

    }

    function addNFTComment(uint nftId, string memory text) public {
        Comment[] storage comments = nft[nftId].comments;
        comments.push(Comment({id: comments.length, user: msg.sender, upVotes:0, downVotes:0, text:text}));
    }

    modifier notVotedNFT(uint nftId) {
        require(nftVotesMapping[msg.sender].nftVote[nftId] != VoteType.upVote && nftVotesMapping[msg.sender].nftVote[nftId] != VoteType.downVote);
        _;
    }

    modifier notVotedNFTComment(uint nftId, uint commentId) {
        require(nftCommentVotesMapping[msg.sender][nftId].nftCommentVote[commentId] != VoteType.upVote && nftCommentVotesMapping[msg.sender][nftId].nftCommentVote[commentId] != VoteType.downVote);
        _;
    }

    function upVoteNFT(uint nftId) notVotedNFT(nftId) public {
        nft[nftId].upVotes ++;
        nftVotesMapping[msg.sender].nftVote[nftId] = VoteType.upVote;
    }

    function downVoteNFT(uint nftId) notVotedNFT(nftId) public {
        nft[nftId].downVotes ++;
        nftVotesMapping[msg.sender].nftVote[nftId] = VoteType.downVote;
    }

    function upVoteNFTComment(uint nftId, uint commentId) notVotedNFTComment(nftId, commentId) public {
        nft[nftId].comments[commentId].upVotes ++;
        nftCommentVotesMapping[msg.sender][nftId].nftCommentVote[commentId] = VoteType.upVote;
    }

    function downVoteNFTComment(uint nftId, uint commentId) notVotedNFTComment(nftId, commentId) public {
        nft[nftId].comments[commentId].downVotes ++;
        nftCommentVotesMapping[msg.sender][nftId].nftCommentVote[commentId] = VoteType.downVote;
    }

    function getNFT(uint nftId) public view returns(uint, uint, uint, string memory, string memory) {
       NFT storage n = nft[nftId];
       return (n.id, n.upVotes, n.downVotes, n.contractAddress, n.tokenID);
    }

    function getNFTCount() public view returns(uint){
        return nft.length;
    }

    function getNFTCommentCount(uint nftID) public view returns(uint){
        return nft[nftID].comments.length;
    }

    function getNFTComment(uint nftId, uint commentId) public view returns(uint, uint, uint, string memory) {
       Comment storage comment = nft[nftId].comments[commentId];
       return (comment.id, comment.upVotes, comment.downVotes, comment.text);
    }

}