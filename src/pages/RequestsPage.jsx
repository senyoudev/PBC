import React, { useState, useEffect } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import RequestsTable from "../components/RequestsTable/RequestsTable";
import { useWeb3React } from "@web3-react/core";
import NOAP from "../contracts/NOAP.json";
import { useContract } from "../hooks/useContract";
import { useParams } from "react-router";
import Loader from "../components/Loader/Loader";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";

const GAS_AMOUNT = 3000000;

function RequestsPage() {
  const [ending,setEnding] = useState(false)
  const [loading, setLoading] = useState(true);
  const contract = useContract(NOAP);
  const [ended, setEnded] = useState();
  const [name, setName] = useState();
  const { account } = useWeb3React();
  const params = useParams();

  useEffect(() => {
    const getEnded = async () => {
      const eventStatus = await contract?.contract?.methods
        .getEventEnded(params.id)
        .call();
      const eventName = await contract?.contract?.methods
        .getEventName(params.id)
        .call();
      setName(eventName);
      setEnded(eventStatus);
      setLoading(false)
    };
    getEnded();
  }, [contract, params.id]);

  const handleEndEvent = async (e) => {
    setEnding(true)
    try{
      await contract?.contract?.methods
        .endEvent(params.id)
        .send({ from: account, gas: GAS_AMOUNT });
    } catch(err) {
          NotificationManager.error("Something went wrong");
    }
    setEnding(false)
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="requestsMain">
          <NotificationContainer />
          <Container>
            <h1 className="requestsPageTitle">
              manage your NOAP <br />
              event
            </h1>
            <div className="requests">
              <div className="eventRequestsTitle">
                <Row
                  className="d-flex align-items-center justify-content-between"
                  style={{ width: "100%" }}
                >
                  <Col>
                    <div className="ImageAndName">
                      <div className="eventRequestsImage"></div>
                      <div className="eventRequestsName">{name}</div>
                    </div>
                  </Col>
                  <Col className="d-flex "></Col>
                </Row>
              </div>
              <RequestsTable />
            </div>

            <div className="text-center">
              <Button
                className="endEventButton"
                disabled={ended || ending}
                onClick={handleEndEvent}
              >
                {ended ? "Event completed" : "End event"}
              </Button>
            </div>
          </Container>
        </div>
      )}
    </>
  );
}

export default RequestsPage;
