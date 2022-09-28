import React from 'react'
import { Container,Accordion } from 'react-bootstrap';
import { motion } from "framer-motion";

function Faq() {
  return (
    <div className="faqMain">
      <Container
        className="d-flex justify-content-center align-items-center flex-column"
      >
        <div className="faqHeader d-flex align-items-end">
          <h1 className="text-left">
            Frequently Asked <br />
            Questions 
          </h1>
          <motion.div className="questionMark"
            animate={{ rotate: [180]}}
            transition={{ ease: "linear", delay: 1.5}}>?!
            </motion.div>
        </div>
        <Accordion
          style={{ width: "70%", marginBottom: "10px" }}
        >
          <Accordion.Item eventKey="0"
          className="faqItemsBackground">
            <Accordion.Header>What Is A NOAP?</Accordion.Header>
            <Accordion.Body>
              The Notarized Attendance Protocol (and corresponding assets, NOAPs), are a way for event coordinators to notarize participation and issue digital receipts to event attendees.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        
        <Accordion
          style={{ width: "70%", marginBottom: "10px" }}
        >
          <Accordion.Item eventKey="0"
          className="faqItemsBackground">
            <Accordion.Header>How To Issue NOAP?</Accordion.Header>
            <Accordion.Body>
            In order to issue NOAPs, one must first create an event. Anyone can create an event. In order to create an event, one needs the URL to the asset metadata (an NFT JSON file) which is submitted in the contract call to create the event. A given metadata URL can only be used for one event, however a single event can generate many NOAPs.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        
        <Accordion
          style={{ width: "70%", marginBottom: "10px" }}
        >
          <Accordion.Item eventKey="0"
          className="faqItemsBackground">
            <Accordion.Header>Who Can Mint NOAPs?</Accordion.Header>
            <Accordion.Body>
              By default, the event creator has the minter privilege, allowing them to issue NOAPs to participants.             
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        
        <Accordion
          style={{ width: "70%", marginBottom: "10px" }}
        >
        <Accordion.Item eventKey="0"
          className="faqItemsBackground">
            <Accordion.Header>Can Anyone Claim A NOAP?</Accordion.Header>
            <Accordion.Body>
              The event creator should send you a link to the event details page or his ethereum address you can use it to search for the event and claim your NOAP.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        
        <Accordion
          style={{ width: "70%", marginBottom: "10px" }}
        >
        <Accordion.Item eventKey="0"
          className="faqItemsBackground">
            <Accordion.Header>For How Much Time The NOAP Claim will be available?</Accordion.Header>
            <Accordion.Body>
              The NOAP claim is always availabe until the minter (event creator) ends the event.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        
      </Container>
    </div>
  );
}

export default Faq