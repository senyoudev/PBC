import React,{useState} from 'react'
import CreatEventFrom from "../components/Form/CreateEventForm";


function CreateEvent() {

  return (
    <div className="container content">
      <div className="headText">
        <h1 className="text">
          create your noap <br />
          event NOW
        </h1>
        <div className="image"></div>
      </div>
    

      <CreatEventFrom  />
    </div>
  );
}

export default CreateEvent
