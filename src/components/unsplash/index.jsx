import React, { Fragment, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { createClient } from "pexels";
import debounce from "lodash.debounce";
import "./style.css";

const client = createClient('563492ad6f9170000100000191ca2aaceae24568876d1777e39ef44c');

let counter = 0;

const Loader = () => {
  return <div className="loader-container">
      <span className="loader"></span>
    </div>;
};

const PexelsImage = ({ url, key }) => (
  <div className="image-item" key={key} >
    <img src={url} />
  </div>
);

export const Collage = () => {
  const [resData, setData] = useState({});
  const [query, setQuery] = useState("");

  const didMount = React.useRef(false);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    fetchImages({ query });
  }, [query]);

  const fetchImages = (payload) => {
    const { count = 5, query = "" } = payload || {};

    if (query) {
      client.photos.search({ query, page: ++counter, per_page: count }).then(res => {
        setData(counter === 1 ? res : { ...res, photos: [...resData.photos, ...res.photos] });
      });
    } else {
      client.photos.curated({ page: ++counter, per_page: count }).then(res => {
        setData(counter === 1 ? res : { ...res, photos: [...resData.photos, ...res.photos] });
      });
    }
  };

  const searchOnChange = (event) => {
    counter = 0;
    setData({});
    setQuery(event.target.value);
  };

  const searchOnChangeDebounced = debounce(searchOnChange, 400);

  return (
    <div className="hero is-fullheight is-bold is-info">
      <div className="hero-body">
        <div className="container">
          <div className="header content">
            <input placeholder="Search" className="search" onChange={searchOnChangeDebounced}></input>
          </div>
          <InfiniteScroll
            dataLength={resData.photos ? resData.photos.length : 0}
            next={() => fetchImages({ count: 5, query })}
            hasMore={resData.total_results > resData.page * resData.per_page}
            loader={resData.photos && resData.photos.length ? <Loader/> : null}
            scrollThreshold={0.95}
          >
            <div className="image-grid">
              {
                resData && resData.photos && resData.photos.length ? resData.photos.map((image, index) => (
                  <Fragment key={index}>
                    <PexelsImage
                      url={image.src.medium}
                      key={index}
                    />
                  </Fragment>
                )) : <Loader />
              }
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};