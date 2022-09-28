// SPDX-License-Identifier: MIT
// https://github.com/OpenZeppelin/openzeppelin-contracts/commit/8e0296096449d9b1cd7c5631e917330635244c37
// import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

pragma experimental ABIEncoderV2;
pragma solidity >=0.4.22 <0.9.0;

contract Test721 is ERC721URIStorage {
    constructor() ERC721("TESTs", "TEST") {}

    function mint(
        uint256 tokenID, // refference
        address recipient, // one
        string memory tokenURI // indedifier d token
    ) public {
        _mint(recipient, tokenID);
        _setTokenURI(tokenID, tokenURI);
    }
}
