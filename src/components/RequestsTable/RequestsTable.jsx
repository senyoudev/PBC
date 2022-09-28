import React,{useEffect,useState} from 'react'
import './RequestsTable.css'
import Table from 'react-bootstrap/Table';
import { Button } from "react-bootstrap"
import { useWeb3React } from "@web3-react/core";
import {useContract} from '../../hooks/useContract'
import NOAP from '../../contracts/NOAP.json'
import { useParams, useNavigate } from "react-router-dom";
import Request from '../Request/Request';
import Loader from '../Loader/Loader';



function RequestsTable() {

  const [reqIDS,setReqIDS] = useState([])
   const params = useParams();
  const [loading, setLoading] = useState(true);

  const contract = useContract(NOAP);
  useEffect(() => {
    const getRequestIds = async () => {

          const ids = await contract?.contract?.methods
            .getEventRequestIDs(params.id)
            .call();
              setReqIDS(ids)   
              setLoading(false)   
      }
    getRequestIds();
  },[contract,params.id,reqIDS]);
  return (
    <>
      {loading ? (
        <Loader />
      ):(
        <div>
      <Table responsive hover className="text-center">
        <thead>
          <tr>
            <th>Addresses</th>
            <th>Claim Request Dates</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reqIDS?.map((id) => (
            <Request
              key={id}
              req={id}
              event={params.id}
            />
          ))}
        </tbody>
      </Table>
    </div>
      )}
    </>
  );
}

export default RequestsTable
