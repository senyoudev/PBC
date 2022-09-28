import React, { useState, useEffect } from "react";
import { Button, Container } from "react-bootstrap";
import { useContract } from "../hooks/useContract";
import NOAP from "../contracts/NOAP.json";
import { useWeb3React } from "@web3-react/core";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader/Loader";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";

const GAS_AMOUNT = 3000000;

function EventPage() {
  const { account } = useWeb3React();
  const params = useParams();
  const contract = useContract(NOAP);
  const [date, setDate] = useState();
  const [description, setDescription] = useState();
  const [name, setName] = useState();
  const [online, setOnline] = useState(false);
  const [ended, setEnded] = useState();
  const [city, setCity] = useState();
  const [country, setCountry] = useState();
  const [loading, setLoading] = useState(true);
  const [claiming,setClaiming] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    const getDatas = async () => {
      setLoading(true);
      try {
        const date = await contract?.contract?.methods
          .getEventDate(params.id)
          .call();
        const description = await contract?.contract?.methods
          .getEventDescription(params.id)
          .call();
        const name = await contract?.contract?.methods
          .getEventName(params.id)
          .call();
        const online = await contract?.contract?.methods
          .getEventIsOnline(params.id)
          .call();
        const city = await contract?.contract?.methods
          .getEventCity(params.id)
          .call();
        const country = await contract?.contract?.methods
          .getEventCountry(params.id)
          .call();
        const ended = await contract?.contract?.methods
          .getEventEnded(params.id)
          .call();
          const ids = await contract?.contract?.methods
            .getEventTokenHolders(params.id)
            .call();

          console.log("tokens", ids);
        setEnded(ended);
        setName(name);
        setDescription(description);
        setDate(date);
        setOnline(online);
        setCity(city);
        setCountry(country);
        setDate(date);
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };
    getDatas();
  }, [contract,params.id]);

  const sendRequest = async () => {
    setClaiming(true)
    try {
      const dateRequest = moment(new Date()).format("MMM Do YYYY");

    await contract.contract.methods
      .createRequest(params.id, account, dateRequest)
      .send({
        from: account,
        gas: GAS_AMOUNT,
      });
      

    return navigate(`/requests/${params.id}`);
    } catch(err) {
      console.log(err)
      NotificationManager.error("Something went wrong");
    }
      setClaiming(false);

  };

  const manageRequests = async () => {
    return navigate(`/requests/${params.id}`);
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="eventPage">
          <NotificationContainer />
          <div className="eventPageTitle">
            {/* <Container calssName='eventPageTitleFlex'> */}
            <div className="eventPageImage"></div>
            <div className="eventName">
              {name}
              <br />
            </div>
            {/* </Container> */}
          </div>
          <Container>
            <div className="eventPageDate">
              <p>{date}</p>
              {/* <div className="lineDecocation"></div> */}
            </div>

            <div className="eventPageDescription">{description}</div>

            <div className="bottomSectionEvent">
              <div className="additionalInfo">
                <p className="additionalInfoTitle">additional information</p>
                <div className="informations">
                  <p className="location">{online ? "Online" : "Real life"}</p>
                  <p className="country">{country}</p>
                  <p className="city">{city}</p>
                </div>
              </div>
              <Button
                className="claimButton"
                onClick={sendRequest}
                disabled={ended || claiming}
              >
                Claim you NOAP
              </Button>
              <Button className="claimButton" onClick={manageRequests}>
                Manage Your Event
              </Button>
            </div>
          </Container>
        </div>
      )}
    </>
  );
}

export default EventPage;
