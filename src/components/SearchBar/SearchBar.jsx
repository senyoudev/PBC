import React,{useEffect, useState} from 'react';
import './SearchBar.css'
import { useNavigate } from "react-router-dom";

function SearchBar() {
   const navigate = useNavigate();
   const [keyword, setKeyword] = useState("");

   const submitHandler = (e) => {
     e.preventDefault();
     return navigate(`/events?address=${keyword}`);
   };

  return (
    <div className="searchBarMain">
      <form class="d-flex searchBar" onSubmit={submitHandler}>
        <input
          onChange={(e) => setKeyword(e.target.value)}
          type="search"
          class="form-control form-control searchInput"
          id="floatingInput"
          placeholder="Search by creator's address or by Event's name"
        />
        <button class="btn btn-primary searchButton" type="submit">
          Search{" "}
        </button>
      </form>
    </div>
  );
}

export default SearchBar
