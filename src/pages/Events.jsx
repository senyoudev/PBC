import React,{useEffect,useState} from "react";
import EventCard from "../components/EventCard/EventCard";
import SearchBar from "../components/SearchBar/SearchBar";
import {Col,Row} from 'react-bootstrap'
import {  useSearchParams } from "react-router-dom";
import {useContract} from '../hooks/useContract'
import NOAP from '../contracts/NOAP.json'
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Loader from "../components/Loader/Loader";


function Events() {
  const [searchParams] = useSearchParams();
  const [eventsIDS,setEventsIDS] = useState([])
  const contract = useContract(NOAP);
  const [loading,setLoading] = useState(false)



  useEffect(() => {
    const getEventIds = async () => {
      setLoading(true);
      if (searchParams.get("address")) {
        try {
          //handle the search by creator's address or by event's name
          if(searchParams.get("address").startsWith("0x")) {
            const ids = await contract?.contract?.methods
              .getUserEventIDs(searchParams.get("address"))
              .call();
              setEventsIDS(ids);
          } else {
             const ids = await contract?.contract?.methods
               .getEventIdByName(searchParams.get("address"))
               .call();
             setEventsIDS(Array.from(ids));
          }
          
        } catch (err) {
          NotificationManager.error("No results found");
        }
      }
      setLoading(false);
    };
    getEventIds();
  }, [contract,searchParams]);



  
  return (
    <div className="main eventsMain">
      <NotificationContainer />

      <SearchBar />
      {loading ? (
        <Loader />
      ) : (
        <Row className="Events d-flex ">
          {eventsIDS?.map((event) => (
            <Col md={4} xl={3} sm={6} key={event}>
              <EventCard event={event} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default Events;
