let videoPlayer = document.querySelector("video");
let record = document.querySelector("#record");
let capture = document.querySelector("#capture");
let filters = document.querySelector(".filters");
let myfilter = document.querySelector(".myfilter");
let zoom = document.querySelector(".zoom");
let zoomIn = document.querySelector(".zoomIn");
let zoomOut = document.querySelector(".zoomOut");
let gallery = document.querySelector("#gallery");

let isRecording = false;
let mediaRecorder;
let Chunks = [];
let filterApplied = "";
let currentZoom = 1; //limit of zoom set to 3.

zoomIn.addEventListener("click", () => {
  currentZoom += 0.1;
  if (currentZoom > 3) {
    currentZoom = 3;
    return;
  }
  videoPlayer.style.transform = `scale(${currentZoom})`;
});

zoomOut.addEventListener("click", () => {
  currentZoom -= 0.1;
  if (currentZoom < 1) {
    currentZoom = 1;
    return;
  }
  videoPlayer.style.transform = `scale(${currentZoom})`;
});

record.addEventListener("click", () => {
  videoPlayer.style.transform = `scale(1)`;
  if (isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    filters.style.display = "flex";
    zoom.style.display = "flex";
    record.querySelector("span").classList.remove("rec_span");
  } else {
    mediaRecorder.start();
    isRecording = true;
    filters.style.display = "none";
    zoom.style.display = "none";
    if (document.querySelector(".myfilter")) {
      document.querySelector(".myfilter").remove();
    }
    record.querySelector("span").classList.add("rec_span");
  }
});

capture.addEventListener("click", () => {
  videoPlayer.style.transform = `scale(1)`;
  capture.classList.add("cap");
  let captureCanvas = document.createElement("canvas");
  captureCanvas.width = videoPlayer.videoWidth; //-->resolution width of video player instead of window width.example if resolution of canvas is 1280x867 then 1280 is my width here of canvas
  captureCanvas.height = videoPlayer.videoHeight;

  let tool = captureCanvas.getContext("2d");
  tool.translate(captureCanvas.width / 2, captureCanvas.height / 2);
  tool.scale(currentZoom, currentZoom);
  tool.translate(-captureCanvas.width / 2, -captureCanvas.height / 2);
  tool.drawImage(videoPlayer, 0, 0);
  //document.querySelector("body").append(captureCanvas);

  if (filterApplied != "") {
    tool.fillStyle = filterApplied;
    tool.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
  }
  let url = captureCanvas.toDataURL();
  // let a = document.createElement("a");
  // a.href = url;
  // a.download = "image.png";
  // a.click();
  // a.remove();
  SaveMedia(url);
  setTimeout(() => {
    capture.classList.remove("cap");
  }, 500);
});

let Navpromise = navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false,
});

Navpromise.then((mediaStream) => {
  videoPlayer.srcObject = mediaStream;

  mediaRecorder = new MediaRecorder(mediaStream);

  mediaRecorder.addEventListener("dataavailable", (e) => {
    Chunks.push(e.data);
  });

  mediaRecorder.addEventListener("stop", () => {
    let blob = new Blob(Chunks, { type: "video/mp4" });
    //The MediaRecorder method start(), which is part of the MediaStream Recording API, begins recording media into one or more Blob objects.
    Chunks = []; //empt the chunks array becuse we already shifts our chunks data to big raw file
    // let link = URL.createObjectURL(blob); //-->create the file of file
    // let a = document.createElement("a");
    // a.href = link;
    // a.download = "video.mp4";
    // a.click();
    SaveMedia(blob);
  });
}).catch((err) => {
  console.log("access not given");
});

filters.addEventListener("click", (e) => {
  let allFilter = filters.querySelectorAll(".filter");

  if (filterApplied != "") {
    for (let i = 0; i < allFilter.length; i++) {
      allFilter[i].classList.remove("selectedFilter");
    }
    document.querySelector(".video_container div").remove();
  }
  e.target.classList.add("selectedFilter");

  filterApplied = e.target.style.backgroundColor;

  let filterDiv = document.createElement("div");
  filterDiv.classList.add("myfilter");
  // console.log(videoPlayer.videoHeight, videoPlayer.videoWidth);
  filterDiv.style.backgroundColor = filterApplied;
  document.querySelector(".video_container").append(filterDiv);
});

gallery.addEventListener("click", () => {
  location.assign("Gallery.html");
});
