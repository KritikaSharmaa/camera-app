let req = indexedDB.open("GalleryStore", 1);

let database;

req.addEventListener("success", () => {
  database = req.result;
});

req.addEventListener("upgradeneeded", () => {
  database = req.result;
  let objectStore = database.createObjectStore("media", { keyPath: "mId" });
});
req.addEventListener("error", () => {});

//function call to save photo/videos from script.js file
function SaveMedia(media) {
  if (!database) return;

  let data = {
    mId: Date.now(),
    DataMedia: media,
  };

  let tx = database.transaction("media", "readwrite");
  let mediaObjectstoreAcess = tx.objectStore("media");
  mediaObjectstoreAcess.add(data);
}

function ViewMedia() {
  if (!database) return;
  let tx = database.transaction("media", "readonly");
  let mediaObjectstoreAcess = tx.objectStore("media");

  let cursorReq = mediaObjectstoreAcess.openCursor();

  let galleryContainer = document.querySelector(".gallery-container");

  cursorReq.addEventListener("success", () => {
    let cursorPoints = cursorReq.result;
    if (cursorPoints) {
      //   console.log(cursorPoints);
      let mediaCard = document.createElement("div");
      mediaCard.classList.add("media-card");
      mediaCard.innerHTML = `<div class="actual-media"></div>
      <div class="media-buttons">
          <button class="media-download">Download</button>
          <button class="media-delete" data-mid="${cursorPoints.value.mId}">Delete</button>
      </div>`;
      let currentMediadata = cursorPoints.value.DataMedia;
      let ShowMedia = mediaCard.querySelector(".actual-media");
      let typeOfMedia = typeof currentMediadata;

      if (typeOfMedia == "string") {
        let image = document.createElement("img");
        image.src = currentMediadata;
        ShowMedia.append(image);
        mediaCard
          .querySelector(".media-download")
          .addEventListener("click", () => {
            DownloadMedia(currentMediadata, "image");
          });
      } else if (typeOfMedia == "object") {
        let video = document.createElement("video");
        let url = URL.createObjectURL(currentMediadata); //blob is a object
        video.src = url;
        video.autoplay = true;
        video.loop = true;
        video.controls = true;
        ShowMedia.append(video);
        mediaCard
          .querySelector(".media-download")
          .addEventListener("click", () => {
            DownloadMedia(url, "video");
          });
      }

      mediaCard
        .querySelector(".media-delete")
        .addEventListener("click", (e) => {
          let mId = Number(e.currentTarget.getAttribute("data-mid"));
          DeleteMedia(mId);
          e.currentTarget.parentElement.parentElement.remove();
        });

      galleryContainer.append(mediaCard);

      cursorPoints.continue();
    }
  });
}

function DownloadMedia(url, type) {
  let anchor = document.createElement("a");
  anchor.href = url;
  if (type == "image") anchor.download = "image/.png";
  else if (type == "video") anchor.download = "video/.mp4";
  anchor.click();
  anchor.remove();
}

function DeleteMedia(mId) {
  let tx = database.transaction("media", "readwrite");
  let AccesToObjectStore = tx.objectStore("media");
  AccesToObjectStore.delete(mId);
}
