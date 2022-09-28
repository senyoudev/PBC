// SPDX-License-Identifier: MIT
// https://github.com/OpenZeppelin/openzeppelin-contracts/commit/8e0296096449d9b1cd7c5631e917330635244c37
import "../node_modules/@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "../node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "../node_modules/@openzeppelin/contracts/utils/Context.sol";

import "./IERC2981.sol";
import "./BaseRelayRecipient.sol";

pragma experimental ABIEncoderV2;
pragma solidity >=0.4.22 <0.9.0;

contract NOAP is Context, ERC165Storage, ERC721Burnable, BaseRelayRecipient, IERC2981 {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;

    string private constant ERROR_INVALID_INPUTS = "Each field must have the same number of values";

    struct Evt {
        bool ended;
        address royalty;
        string tokenURI;
        string description;
        string name;
        string country;
        string city;
        bool online;
        string startdate;
        string endDate;
        uint256 limitSupply;
        string creatorEmail;
        EnumerableSet.UintSet tokens;
        EnumerableSet.AddressSet minters;
    }

    struct Req {
        uint256 eventID;
        address attender;
        string date;
        bool minted;
    }

    mapping(address => EnumerableSet.UintSet) private userEventIDs;
    mapping(uint256 => EnumerableSet.UintSet) private eventRequestIDs;

    mapping(uint256 => Req) requests;
    mapping(uint256 => Evt) evts;
    mapping(string => uint256) events;
    mapping(uint256 => uint256) private tokenToEventID;
    mapping(bytes32 => uint256) private hashToEventID;
    uint256 private tokenIDCounter;
    uint256 private eventIDCounter;
    uint256 private requestIDCounter;

    uint256 private constant _NULL_EVENT_ID = 0;
    address private constant _NULL_ADDRESS = 0x0000000000000000000000000000000000000000;

    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;


    function getTime() public view virtual returns(uint256) {
        return block.timestamp;
    }

    // override supportsInterface
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Storage, ERC721, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC165).interfaceId;
    }

    //

    constructor() ERC721("NOAPs", "NOAP") {
        _registerInterface(_INTERFACE_ID_ERC2981);

        // hardcode the trusted forwarded for EIP2771 metatransactions
        _setTrustedForwarder(0x86C80a8aa58e0A4fa09A69624c31Ab2a6CAD56b8); // xDAI trusted forwarder
    }

    /**
     * Mint a single token
     */
    function mint(
        uint256 eventID,
        address recipient,
        uint256 requestID
    ) external {
        requests[requestID].minted = true;
        Evt storage evt = evts[eventID];
        require(
            evt.limitSupply > evt.tokens.length(),
            "the total supply for this event is reached!"
        );
        require(!evt.ended, "Event Ended");
        _checkSenderIsMinter(evt);
        _mintEventToken(recipient, eventID);
    }

    function bytesToAddress(bytes memory bys) private pure returns (address addr) {
        assembly {
            addr := mload(add(bys, 32))
        }
    }

    /**
     * Mint multiple tokens for a single event
     */
    function mintBatch(
        uint256 eventID,
        bytes[] memory recipients,
        uint256[] memory requestIds
    ) external {
        Evt storage evt = evts[eventID];
        require(!evt.ended, "Event Ended");
        _checkSenderIsMinter(evt);
        address[] memory addr;

        for (uint256 i = 0; i < requestIds.length; i++) {
            requests[i].minted = true;
        }

        for (uint256 i = 0; i < recipients.length; i++) {
            addr[i] = bytesToAddress(recipients[i]);
        }

        for (uint256 i = 0; i < recipients.length; i++) {
            _mintEventToken(addr[i], eventID);
        }
    }

    /**
     * Create an event based on the metadata URI.
     * The caller is the sole minter.
     * Each event is a unique <contract, tokenURI> pair and cannot be recreated.
     */
    function createEvent(
        string memory tokenURI,
        string memory description,
        string memory name,
        string memory country,
        string memory city,
        bool online,
        string memory startdate,
        string memory enddate,
        string memory creatorEmail,
        uint256 limitSupply
    ) external returns (uint256) {
        //address(this) refers to the address of the contract instance
        bytes32 eventHash = _computeEventHash(address(this), tokenURI);

        uint256 eventID = _createEvent(
            eventHash,
            tokenURI,
            description,
            name,
            country,
            city,
            online,
            startdate,
            enddate,
            creatorEmail,
            limitSupply
        );

        Evt storage evt = evts[eventID];
        evt.minters.add(_msgSender());
        evt.royalty = _msgSender();

        userEventIDs[_msgSender()].add(eventID);
        return eventID;
    }

    //createRequest(eventId,attender,date)

    //mint for one person
    //mint for multi-user
    //add minters
    //end event
    /**
     * Claim a noap
     * authorized to be done by everyone
     */
    function createRequest(
        uint256 eventID,
        address attender,
        string memory date
    ) external {
        Evt storage evt = evts[eventID];
        require(!evt.ended, "Event Ended");
        uint256 requestID = ++requestIDCounter;
        requests[requestID].eventID = eventID;
        requests[requestID].attender = attender;
        requests[requestID].date = date;
        requests[requestID].minted = false;
        eventRequestIDs[eventID].add(requestID);
    }

    /**
     * Token minting from other contracts (burned and reminted here) cannot be halted.
     */
    function endEvent(uint256 eventID) external {
        Evt storage evt = evts[eventID];
        _checkSenderIsMinter(evt);
        evt.ended = true;
    }

    /**
     * Add a minter to the event. Minter can create infinite tokens. Caller must be a minter
     */
    function addEventMinter(uint256 eventID, address minter) external {
        Evt storage evt = evts[eventID];
        _checkSenderIsMinter(evt);
        evt.minters.add(minter);

        userEventIDs[minter].add(eventID);
    }

    function renounceEventMinter(uint256 eventID) external {
        Evt storage evt = evts[eventID];
        _checkSenderIsMinter(evt);
        evt.minters.remove(_msgSender());

        userEventIDs[_msgSender()].remove(eventID);
    }

    function _checkSenderIsMinter(Evt storage evt) internal view {
        require(evt.minters.contains(_msgSender()), "Not event minter");
    }

    function _createEvent(
        bytes32 eventHash,
        string memory tokenURI,
        string memory description,
        string memory name,
        string memory country,
        string memory city,
        bool online,
        string memory startdate,
        string memory enddate,
        string memory creatorEmail,
        uint256 limitSupply
    ) internal returns (uint256) {
        require(hashToEventID[eventHash] == _NULL_EVENT_ID, "Event already created");

        uint256 eventID = ++eventIDCounter;
        evts[eventID].tokenURI = tokenURI;
        evts[eventID].description = description;
        evts[eventID].name = name;
        evts[eventID].country = country;
        evts[eventID].city = city;
        evts[eventID].startdate = startdate;
        evts[eventID].endDate = enddate;
        evts[eventID].creatorEmail = creatorEmail;
        evts[eventID].online = online;
        evts[eventID].limitSupply = limitSupply;
        events[name] = eventID;

        // Map the event hash back to the Event
        hashToEventID[eventHash] = eventID;

        return eventID;
    }

    function _mintEventToken(address recipient, uint256 eventID) internal {
        // Mint the token. ID is generated by hashing the source contract and id, bitmasked for shortness
        uint256 tokenID = ++tokenIDCounter;
        _mint(recipient, tokenID);

        // Increment the minted counter
        evts[eventID].tokens.add(tokenID);

        // Map the token back to the Event
        tokenToEventID[tokenID] = eventID;
    }

    function _computeEventHash(address tokenContract, string memory tokenURI)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(tokenContract, tokenURI));
    }

    function getEventMinterTotal(uint256 eventID) public view returns (uint256) {
        return evts[eventID].minters.length();
    }

    //this is what I added
    function getRequestUser(uint256 requestId) public view returns (address) {
        return requests[requestId].attender;
    }

    function getRequestDate(uint256 requestId) public view returns (string memory) {
        return requests[requestId].date;
    }

    function getRequestIsMinted(uint256 requestId) public view returns (bool) {
        return requests[requestId].minted;
    }

    function getEventDescription(uint256 eventID) public view returns (string memory) {
        return evts[eventID].description;
    }

    function getEventName(uint256 eventID) public view returns (string memory) {
        return evts[eventID].name;
    }

    function getEventIdByName(string memory name) public view returns (uint256) {
        return events[name];
    }

    function getEventCountry(uint256 eventID) public view returns (string memory) {
        return evts[eventID].country;
    }

    function getEventCity(uint256 eventID) public view returns (string memory) {
        return evts[eventID].city;
    }

    function getCreatorEmail(uint256 eventID) public view returns (string memory) {
        return evts[eventID].creatorEmail;
    }

    function getEventMinterAt(uint256 eventID, uint256 index) public view returns (address) {
        return evts[eventID].minters.at(index);
    }

    function getEventDate(uint256 eventID) public view returns (string memory) {
        return evts[eventID].endDate;
    }

    function getEventIsOnline(uint256 eventID) public view returns (bool) {
        return evts[eventID].online;
    }

    function getEventIsMinter(uint256 eventID, address addr) public view returns (bool) {
        return evts[eventID].minters.contains(addr);
    }

    function getEventTokenSupply(uint256 eventID) public view returns (uint256) {
        return evts[eventID].tokens.length();
    }

    function getEventTokenURI(uint256 eventID) public view returns (string memory) {
        return evts[eventID].tokenURI;
    }

    function getEventTokenIDAt(uint256 eventID, uint256 index) public view returns (uint256) {
        return evts[eventID].tokens.at(index);
    }

    function getEventTokenIDs(uint256 eventID) public view returns (uint256[] memory) {
        uint256 supply = getEventTokenSupply(eventID);
        uint256[] memory tokenIDs = new uint256[](supply);
        for (uint256 i = 0; i < tokenIDs.length; i++) {
            tokenIDs[i] = getEventTokenIDAt(eventID, i);
        }
        return tokenIDs;
    }

    function getEventTokenHolders(uint256 eventID) public view returns (address[] memory) {
        uint256 supply = getEventTokenSupply(eventID);
        address[] memory owners = new address[](supply);
        for (uint256 i = 0; i < owners.length; i++) {
            owners[i] = ownerOf(getEventTokenIDAt(eventID, i));
        }
        return owners;
    }

    function getEventEnded(uint256 eventID) public view returns (bool) {
        return evts[eventID].ended;
    }

    function getEventRoyaltyAddress(uint256 eventID) public view returns (address) {
        return evts[eventID].royalty;
    }

    function getLastTokenID() public view returns (uint256) {
        return tokenIDCounter;
    }

    

    function getLastEventID() public view returns (uint256) {
        return eventIDCounter;
    }

    function getUserEventTotal(address user) public view returns (uint256) {
        return userEventIDs[user].length();
    }

    function getRequestsLength(uint256 eventID) public view returns (uint256) {
        return eventRequestIDs[eventID].length();
    }

    function getUserEventAt(address user, uint256 index) public view returns (uint256) {
        return userEventIDs[user].at(index);
    }

    function getEventRequestAt(uint256 eventID, uint256 index) public view returns (uint256) {
        return eventRequestIDs[eventID].at(index);
    }

    function getUserEventIDs(address user) public view returns (uint256[] memory) {
        uint256 numEvents = getUserEventTotal(user);
        uint256[] memory eventIDs = new uint256[](numEvents);
        for (uint256 i = 0; i < numEvents; i++) {
            eventIDs[i] = getUserEventAt(user, i);
        }
        return eventIDs;
    }

    function getEventRequestIDs(uint256 eventID) public view returns (uint256[] memory) {
        uint256 totalRequests = getRequestsLength(eventID);
        uint256[] memory requestIDs = new uint256[](totalRequests);
        for (uint256 i = 0; i < totalRequests; i++) {
            requestIDs[i] = getEventRequestAt(eventID, i);
        }
        return requestIDs;
    }

    /**
     * ERC2981 royalty implementation
     * For events created using this contract, we hardcode a 10% resale royalty the corresponding tokens
     * The recipient of this royalty is controlled by the event minters.
     */
    function royaltyInfo(uint256 tokenID, uint256 salePrice)
        external
        view
        override
        returns (address, uint256)
    {
        address royalty = evts[tokenToEventID[tokenID]].royalty;
        if (royalty == _NULL_ADDRESS) {
            // For tokens that are burned and reminted,
            // we don't track the creator, so zero royalties.
            return (_NULL_ADDRESS, 0);
        }

        return (royalty, salePrice / 10);
    }

    /**
     * Allow any of the event minters to change the royalty recipient
     */
    function changeRoyaltyReceiver(uint256 eventID, address receiver) external {
        Evt storage evt = evts[eventID];
        _checkSenderIsMinter(evt);
        evt.royalty = receiver;
    }

    /* -- END ERC2981 methods */

    /**
     * Overwrite the default `tokenURI` getter.
     * Since all events have the same tokenURI, resolve tokenIDs to events load the URI from the event
     */
    //this will make a warning because it is the same name as tokenURI variable
    function tokenURI(uint256 tokenID) public view virtual override returns (string memory) {
        require(_exists(tokenID), "ERC721Metadata: URI query for nonexistent token");
        return evts[tokenToEventID[tokenID]].tokenURI;
    }

    function burn(uint256 tokenID) public virtual override {
        super.burn(tokenID);
        evts[tokenToEventID[tokenID]].tokens.remove(tokenID);
    }

    function isApprovedOrOwner(address spender, uint256 tokenID) external view returns (bool) {
        return _isApprovedOrOwner(spender, tokenID);
    }

    /* -- BEGIN batch methods */
    function burnBatch(uint256[] memory tokenIDs) external {
        for (uint256 i = 0; i < tokenIDs.length; ++i) {
            burn(tokenIDs[i]);
        }
    }

    function approveBatch(address[] memory tos, uint256[] memory tokenIDs) external {
        require(tos.length == tokenIDs.length, ERROR_INVALID_INPUTS);
        for (uint256 i = 0; i < tos.length; ++i) {
            approve(tos[i], tokenIDs[i]);
        }
    }

    function transferFromBatch(
        address[] memory froms,
        address[] memory tos,
        uint256[] memory tokenIDs
    ) external {
        require(
            froms.length == tos.length && froms.length == tokenIDs.length,
            ERROR_INVALID_INPUTS
        );
        for (uint256 i = 0; i < froms.length; ++i) {
            transferFrom(froms[i], tos[i], tokenIDs[i]);
        }
    }

    function safeTransferFromBatch(
        address[] memory froms,
        address[] memory tos,
        uint256[] memory tokenIDs
    ) external {
        require(
            froms.length == tos.length && froms.length == tokenIDs.length,
            ERROR_INVALID_INPUTS
        );
        for (uint256 i = 0; i < froms.length; ++i) {
            safeTransferFrom(froms[i], tos[i], tokenIDs[i], "");
        }
    }

    function safeTransferFromWithDataBatch(
        address[] memory froms,
        address[] memory tos,
        uint256[] memory tokenIDs,
        bytes[] memory datas
    ) external {
        require(
            froms.length == tos.length &&
                froms.length == tokenIDs.length &&
                froms.length == datas.length,
            ERROR_INVALID_INPUTS
        );
        for (uint256 i = 0; i < froms.length; ++i) {
            safeTransferFrom(froms[i], tos[i], tokenIDs[i], datas[i]);
        }
    }

    /* -- END batch methods */

    /* -- BEGIN IRelayRecipient overrides -- */
    function _msgSender() internal view override(Context, BaseRelayRecipient) returns (address) {
        return BaseRelayRecipient._msgSender();
    }

    string public override versionRecipient = "1";
    /* -- END IRelayRecipient overrides -- */
}
