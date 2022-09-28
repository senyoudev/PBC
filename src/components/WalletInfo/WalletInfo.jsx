import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { formatEther } from '@ethersproject/units';
import './WalletInfo.css'


function WalletInfo() {
  const { active, account, activate, chainId, library } = useWeb3React();
  const balance = useBalance();
  

  return (
    <div className="container walletInfo d-flex justify-content-center">
      <div>
        <div className="walletInfoHeader">
          <h1>
            Hi!
          </h1>
          <p>
            Here is your wallet Informations.
          </p>
        </div>
      
              <>
                <div className="walletInfoContent py-5">
                  <div className="accountAddress pb-5">
                    <h3 className="accountTitle d-flex justify-content-center">
                      Account
                    </h3>
                    <p className=" d-flex justify-content-center">
                      {account}
                    </p>
                  </div>
                  <div className="accountBalanceNetwork">
                    <h3 className="accountBalanceNetworkTitle  d-flex justify-content-center">
                      {chainId === 1 ? "Mainnet" : "Testnet"} Balance
                    </h3>
                    <p className=" d-flex justify-content-center">
                      {balance}
                    </p>
                  </div>
                </div>
                
              </>
      </div>
    </div>
  )
}


function useBalance(){
  const {account} =  useWeb3React();
  const [balance, setBalance] = useState();

  var Eth = require('web3-eth');

  var eth = new Eth(Eth.givenProvider || 'ws://some.local-or-remote.node:8546');

  var Web3 = require('web3');
  var web3 = new Web3(Web3.givenProvider || 'ws://some.local-or-remote.node:8546');

  useEffect(() => {
    if(account) {

      web3.eth.getBalance(account).then(val => setBalance(val));
      
    }
  }, [account]);

  return balance ? `${formatEther(balance)} ETH` : null;
}

export default WalletInfo
