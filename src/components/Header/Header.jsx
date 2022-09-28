import React,{useEffect} from "react";
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import './Header.css'
import {useNavigate} from 'react-router'
import { LinkContainer } from "react-router-bootstrap";
import { useWeb3React } from "@web3-react/core";
import { injected } from "../Connectors";
import web3 from "web3";

function Header() {
  const { active, activate,chainId } = useWeb3React();
  useEffect(() => {
    const activeWallet = async () => {
      if (!active) {
        try {
          await activate(injected);
          
        } catch (ex) {
          console.log("error:", ex);
        }
      } else {
          if (window.ethereum.networkVersion !== chainId) {
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: web3.utils.toHex(chainId) }],
              });
            } catch (err) {
              // This error code indicates that the chain has not been added to MetaMask
              if (err.code === 4902) {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainName: "Polygon Mainnet",
                      chainId: web3.utils.toHex(chainId),
                      nativeCurrency: {
                        name: "MATIC",
                        decimals: 18,
                        symbol: "MATIC",
                      },
                      rpcUrls: ["https://polygon-rpc.com/"],
                    },
                  ],
                });
              }
            }
          }


      }
    };

    activeWallet();
  }, []);
  const navigate = useNavigate('')
  const handleNavigation = () => {
    return navigate('/createEvent')
  }
  return (
    <Navbar expand="lg">
      <Container>
          
        <LinkContainer to="/" className='PageName'>
            <Navbar.Brand >
              NOAPsEvents
            </Navbar.Brand>
        </LinkContainer>


        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="justify-content-center" style={{ width: "100%" }}>
            <LinkContainer to="/">
              <Nav.Link className="d-flex align-items-center navBarLinks">
                <span>Home</span>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/events">
              <Nav.Link className="d-flex align-items-center navBarLinks">
                <span>Events</span>
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/WalletInformations">
              <Nav.Link className="d-flex align-items-center navBarLinks">
                <span>Wallet Informations</span>
              </Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/faq">
              <Nav.Link className="d-flex align-items-center navBarLinks">
                <span>FAQ</span>
              </Nav.Link>
            </LinkContainer>
          </Nav>
          <div className="justify-content-end" style={{ width: "100%" }}>
            <Nav className="d-flex justify-content-end align-items-center">
              <Button onClick={handleNavigation} className="create-btn">
                Create Event
              </Button>
            </Nav>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;