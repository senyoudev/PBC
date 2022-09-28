import React from "react";
import { useState, useEffect } from "react";
import { Form, Row } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useWeb3React } from "@web3-react/core";
import NOAP from "../../contracts/NOAP.json";
import { useNavigate } from "react-router";
import { useContract } from "../../hooks/useContract";
import "./CreateEventForm.css";
import axios from "axios";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import ShareModal from "../modals/ShareModal";



const GAS_AMOUNT = 3000000;

function CreateEventForm() {
  const { account } = useWeb3React();

 
  const [url,setURl] = useState('')
  let [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [online, setOnline] = useState(false);
  const [fileImg, setFileImg] = useState(null);
  const [tokenSupply, setTokenSupply] = useState(1);

  const contract = useContract(NOAP);
  const navigate = useNavigate();

 

  //modal part
   const [show, setShow] = useState(false);

   const handleClose = () => {
    setShow(false);
    return navigate(`/${url}`)
   }
   const handleShow = () => setShow(true);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    //some validation
    //process of uploading the image and the metadata
    try {
      const url = await sendFileToIPFS();
      const tokenURI = await uploadJson(url);
     
       await contract?.contract?.methods
        ?.createEvent(
          tokenURI,
          description,
          name,
          country,
          city,
          online,
          startDate,
          enddate,
          email,
          tokenSupply
        )
        .send({ from: account, gas: GAS_AMOUNT });
           const eventId = await contract?.contract?.methods
             .getLastEventID()
             .call();
        console.log(eventId)
      setURl(`events/${eventId}`);
      handleShow(true)
      setName('')
      setDescription('')
      setStartDate('')
      setEndDate('')
      setCity('')
      setCountry('')
      setFileImg(null)
      setTokenSupply(1)
    } catch (err) {
      console.log(err);
      NotificationManager.warning("Something went wrong");
    }

    setLoading(false);
  };

  const uploadJson = async (url) => {
 
   //make metadata
    const metadata = new Object();
    metadata.name = name;
    metadata.image = url;
    metadata.description = description;

    //make pinata call
    const pinataResponse = await pinJSONToIPFS(metadata);
    if (!pinataResponse.success) {
      NotificationManager.warning(
        "😢 Something went wrong while uploading your tokenURI."
      );
      return;
    }
    const tokenURI = pinataResponse.pinataUrl;
    return tokenURI;
  };

  const pinJSONToIPFS = async (jsonBody) => {
    
    const url = process.env.REACT_APP_URL_JSON;
    //making axios POST request to Pinata ⬇️
    return axios
      .post(url, jsonBody, {
        headers: {
          pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
          pinata_secret_api_key: process.env.REACT_APP_PINATA_API_SECRET,
        },
      })
      .then(function(response) {
        return {
          success: true,
          pinataUrl:
            "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
        };
      })
      .catch(function(error) {
        console.log(error);
        return {
          success: false,
          message: error.message,
        };
      });
  };

  const sendFileToIPFS = async () => {
    if (fileImg) {
      try {
        const formData = new FormData();
        formData.append("file", fileImg);

        const resFile = await axios({
          method: "post",
          url: process.env.REACT_APP_URL_FILE,
          data: formData,
          headers: {
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_API_SECRET,
            "Content-Type": "multipart/form-data",
          },
        });

       const url = `https://ipfs.io/ipfs/${resFile.data.IpfsHash}`;
        return url
        //Take a look at your Pinata Pinned section, you will see a new file added to you list.
      } catch (error) {
        NotificationManager.warning("Error sending File to IPFS: ");
        console.log("Error sending File to IPFS: ");
        console.log(error);
      }
    } else {
      NotificationManager.error("Please choose a file");
    }
  };

  return (
    <div>
      <NotificationContainer />
      <ShareModal url={url} show={show} handleClose={handleClose} />
      <Form>
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
          <Form.Label className="formLable">Event Description</Form.Label>
          <Form.Control
            name="description"
            required
            as="textarea"
            rows={3}
            placeholder="Give a clear description about your NOAP event. This description will be published with your event for collectors and issuers to see."
            className="formBox"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <div className="formItems">
          <Form.Group className="mb-3 rightItem" controlId="email">
            <Form.Label className="formLable">Email</Form.Label>
            <Form.Control
              name="email"
              required
              type="email"
              placeholder="name@example.com"
              className="formBox"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3 leftItem " controlId="location">
            <Form.Label className="formLable">Location</Form.Label>
            <div className="d-flex">
              <CountryDropdown
                className="location-input"
                value={country}
                onChange={(val) => setCountry(val)}
                style={{ marginRight: "10px" }}
              />
              <RegionDropdown
                className="location-input"
                country={country}
                value={city}
                onChange={(e) => setCity(e)}
              />
            </div>
          </Form.Group>
        </div>

        <div className="formItems">
          <Form.Group className="mb-3 rightItem" controlId="startdate">
            <Form.Label className="formLable">Start Date</Form.Label>
            <Form.Control
              name="startdate"
              required
              type="date"
              placeholder="DD/MM/YYYY"
              className="formBox"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3 leftItem" controlId="enddate">
            <Form.Label className="formLable">End date</Form.Label>
            <Form.Control
              name="enddate"
              required
              type="date"
              placeholder="DD/MM/YYYY"
              className="formBox"
              value={enddate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>
        </div>
        <div className="formItems">
          <Form.Group className="mb-3 rightItem" controlId="name">
            <Form.Label className="formLable">Event Name</Form.Label>
            <Form.Control
              name="eventName"
              required
              type=""
              placeholder="enter the name of your NOAP event"
              className="formBox"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formFile" className="mb-3  leftItem">
            <Form.Label>NOAP Artwork</Form.Label>
            <Form.Control
              name="artwork"
              type="file"
              accept="application/jpeg application/png application/jpg"
              className="formBox hidden"
              onChange={(e) => setFileImg(e.target.files[0])}
            />
          </Form.Group>
        </div>
        <div className="formItems">
          <Form.Group controlId="supply" className="mb-3  rightItem">
            <Form.Label>Total NOAPS To Mint</Form.Label>
            <Form.Control
              name="supply"
              type="number"
              className="formBox"
              value={tokenSupply}
              onChange={(e) => setTokenSupply(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="supply" className="mb-3  leftItem">
            <Form.Label></Form.Label>
            <Form.Check
              type="switch"
              id="custom-switch"
              label="Online Event"
              value={online}
              onChange={(e) => setOnline(e.target.checked)}
            />
          </Form.Group>
        </div>
      </Form>
      <Button onClick={handleSubmit} className="submit" disabled={loading}>
        {loading ? "Creating..." : "Create event"}
      </Button>
    </div>
  );
}

export default CreateEventForm;
