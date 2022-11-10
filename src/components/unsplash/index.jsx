import React, { Fragment, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { createClient } from "pexels";
import debounce from "lodash.debounce";
import "./style.css";

const client = createClient('563492ad6f9170000100000191ca2aaceae24568876d1777e39ef44c');

let counter = 0;
const img = new Image();

let offsetX, offsetY;

const Loader = () => {
  return <div className="loader-container">
      <span className="loader"></span>
    </div>;
};

const PexelsImage = ({ url, key, dragStart, dragEnd, onClick }) => (
  <div className="image-item" key={key} >
    <img onClick={onClick} onDragStart={dragStart} onDragEnd={dragEnd} draggable="true" src={url} />
  </div>
);

export const Collage = () => {
  const [resData, setData] = useState({});
  const [query, setQuery] = useState("");

  const didMount = React.useRef(false);

  useEffect(() => {
    fetchImages();
    handleEvents();
  }, []);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    fetchImages({ query });
  }, [query]);

  const handleEvents = () => {
    // document.addEventListener("dragleave", onDragLeave, false);
    document.addEventListener("dragover", (e) => {
        e.preventDefault();
    });
  };

  const fetchImages = (payload) => {
    const { count = 10, query = "" } = payload || {};

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

  function toDataURL(src, callback, clicked){
    var image = new Image();
    image.crossOrigin = 'Anonymous';
    image.onload = function(){
       var canvas = document.createElement('canvas');
       var context = canvas.getContext('2d');
       canvas.height = this.naturalHeight;
       canvas.width = this.naturalWidth;
       context.drawImage(this, 0, 0);
       var dataURL = canvas.toDataURL('image/jpeg');
       callback(dataURL, clicked);
    };
    image.src = src;
 }

 const callback = (dataURI, clicked) => {
  window.parent.postMessage({
    msgType: clicked ? "clicked" : "dragStart",
    dataURI,
    offset: {
      x: offsetX,
      y: offsetY
    }
  }, "*");
}

  const onDragLeave = (event) => {
    const url = event.srcElement.src;

    toDataURL(url, callback);
  };

  const handleImageClick = (event) => {
    const url = event.currentTarget.src;

    toDataURL(url, callback, true);
  };

  const onDragStart = (event) => {
    const height = event.currentTarget.height;
    const width = event.currentTarget.width;
    const url = event.currentTarget.src;

    offsetX = event.nativeEvent.offsetX;
    offsetY = event.nativeEvent.offsetY;

    toDataURL(url.replace("&h=350", `&h=${height}&w=${width}`), callback);

    event.dataTransfer.setDragImage(img, 0, 0);
  };
  
  const onDragEnd = () => {
  };

  const searchOnChangeDebounced = debounce(searchOnChange, 400);

  return (
    <div className="hero is-fullheight is-bold is-info">
      <div className="hero-body">
        <div className="container">
          <div className="header content">
            <input placeholder="Try Cats or Dogs" className="search" onChange={searchOnChangeDebounced}></input>
          </div>
          <InfiniteScroll
            dataLength={resData.photos ? resData.photos.length : 0}
            next={() => fetchImages({ count: 10, query })}
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
                      onClick={handleImageClick}
                      dragStart={onDragStart}
                      dragEnd={onDragEnd}
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