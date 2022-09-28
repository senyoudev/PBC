

const {expect,use} = require("chai")
const {
    deployContract,
    MockProvider,
    solidity
} = require('ethereum-waffle')

const NOAP = artifacts.require("NOAP");
const Test721 = artifacts.require("Test721");




use(solidity);

contract('NOAP', (accounts) => {
    const tokenURIReminted = 'https://example.com/foo.json';
    const tokenURINewEvent = 'https://example.com/bar.json';
    const [
        deployer,
        minterA,
        minterB,
        minterC,
        recipientA,
        recipientB,
        recipientC,
    ] = new MockProvider().getWallets();

    let NOAPContract, testContract;

    it('deploys the NOAP contract a generic 721 Contract', async () => {
        NOAPContract = await deployContract(deployer, NOAP, [])
        testContract = await deployContract(deployer, Test721, []);
    });

    it('mints an NFT on the test contract', async () => {
        await testContract.connect(minterA).mint(1, recipientA.address, tokenURIReminted);
        const tokenURIResult = await testContract.tokenURI(1);
        expect(tokenURIResult).to.equal(tokenURIReminted);
    });

   

    it('creates an event', async () => {
        await NOAPContract.connect(minterA).createEvent(tokenURINewEvent,"desc","name","morocco","meknes",true,"22/12/2022","24/12/2022","younesmeskafe@gmail.com",10);
    });

    it('creates a request', async () => {
        //uint256 eventID,address attender,string date)
        await NOAPContract.connect(minterA).createRequest("0",recipientA.address,"22/2942./424");
        await NOAPContract.getEventRequestIDs("0");
    });

    it('Check if we can get the country of the event by the name',async() => {
        const id = await NOAPContract.getEventIdByName("name");
        expect(id).to.be.equal(1)
    })

  
      it('check if it returns the last eventID', async () => {
        const eventID = await NOAPContract.getLastEventID();
        await expect(eventID).to.be.equal(1);
    });

    it('prevents unauthorized minters from minting', async () => {
        const eventID = await NOAPContract.getLastEventID();
        await expect(NOAPContract.connect(minterC).mint(eventID, recipientC.address)).to.be.reverted;
    });

   

    it('ends an event', async () => {
        const eventID = await NOAPContract.getLastEventID();
        await NOAPContract.connect(minterA).endEvent(eventID);
        await expect(NOAPContract.connect(minterA).mint(eventID, recipientA.address)).to.be.reverted;
    });

  
});