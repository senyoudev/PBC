import React, { useState, useEffect } from "react";
import { useContract } from "../../hooks/useContract";
import NOAP from "../../contracts/NOAP.json";
import { Button } from "react-bootstrap";
import "./Request.css";
import { useWeb3React } from "@web3-react/core";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";

const GAS_AMOUNT = 3000000;

function Request({ req, event }) {
  const [ending,setEnding] = useState(false)
  const contract = useContract(NOAP);
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [minted, setMinted] = useState();
  const { account } = useWeb3React();

  useEffect(() => {
    const getDatas = async () => {
      const address = await contract?.contract?.methods
        .getRequestUser(req)
        .call();
      const date = await contract?.contract?.methods.getRequestDate(req).call();
      const minted = await contract?.contract?.methods
        .getRequestIsMinted(req)
        .call();
      setMinted(minted);
      setDate(date);
      setAddress(address);
    };

    getDatas();
  },[contract,req]);

  const mintHandler = async (e) => {
    e.preventDefault();
    setEnding(true)
    try {
      await contract?.contract?.methods
        .mint(event, address, req)
        .send({ from: account, gas: GAS_AMOUNT });
          NotificationManager.success("minted");  

    } catch (err) {
          NotificationManager.error("Something went wrong");  
          console.log(err)
    }
    setEnding(false)
  };

  return (
    <tr className={minted && "minted"}>
      <td className="address">{address}</td>
      <td className="requestDate">{date}</td>
      <td>
        <Button onClick={mintHandler} disabled={ending} className="SingleMintButton">
          Mint
        </Button>
      </td>
    </tr>
  );
}

export default Request;
