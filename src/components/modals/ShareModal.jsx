import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";
import {
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
} from "react-share";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {FaCopy} from 'react-icons/fa'


function ShareModal({ url, show, handleClose }) {
      
      const [copy, setCopy] = useState(false);
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Share Event</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex justify-content-around">
        <LinkedinShareButton
          url={`${process.env.REACT_APP_BASE_URL}${url}`}
          title="hey here is our event,Don't forget to claim your NOAP"
        >
          <LinkedinIcon
            className="social-icon"
            style={{ opacity: "0.5", borderRadius: "10px" }}
          />
        </LinkedinShareButton>

        <FacebookShareButton
          url={`${process.env.REACT_APP_BASE_URL}/${url}`}
          title="hey here is our event,Don't forget to claim your NOAP"
        >
          <FacebookIcon
            className="social-icon"
            style={{ opacity: "0.5", borderRadius: "10px" }}
          />
        </FacebookShareButton>

        <WhatsappShareButton
          url={`${process.env.REACT_APP_BASE_URL}/${url}`}
          title="hey here is our event,Don't forget to claim your NOAP"
        >
          <WhatsappIcon
            className="social-icon"
            style={{ opacity: "0.5", borderRadius: "10px" }}
          />
        </WhatsappShareButton>

        <TwitterShareButton
          url={`${process.env.REACT_APP_BASE_URL}/${url}`}
          title="hey here is our event,Don't forget to claim your NOAP"
        >
          <TwitterIcon
            className="social-icon"
            style={{ opacity: "0.5", borderRadius: "10px" }}
          />
        </TwitterShareButton>
      </Modal.Body>
      <Modal.Footer>
        <div className="input_group mt-3">
          <FaCopy style={{ color: "#555", fontSize: "20px" }} />
          <input
            type="text"
            value={`${process.env.REACT_APP_BASE_URL}/${url}`}
            readOnly
          />
          <CopyToClipboard
            text={`${process.env.REACT_APP_BASE_URL}/${url}`}
            onCopy={() => setCopy(true)}
          >
            <button className={`${copy ? "copied" : "copy"}`}>
              {copy ? "Copied" : "Copy"}
            </button>
          </CopyToClipboard>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ShareModal;
