// Allows this to work in Firefox (where "browser" is a thing) and
// Chrome (where "chrome" is a thing)
if (typeof browser === "undefined") {
  var browser = chrome;
}

// Call the api to get the current carbon intensity
const getIntensity = () =>
  fetch("https://api.carbonintensity.org.uk/intensity")
    .then((resp) => resp.json())
    .then((x) => x.data[0].intensity.actual);

// Render the image which is a number in a coloured box
const render = (intensity) => {
  // Wait until font actually loaded
  if (!document.fonts.check("bold 90px Just Another Hand")) {
    setTimeout(() => {
      render(intensity);
      return;
    }, 100);
  }

  const ctx = document.createElement("canvas").getContext("2d");
  ctx.canvas.width = 300;
  ctx.canvas.height = 300;

  ctx.font = "bold 90px 'Just Another Hand',cursive";
  ctx.textAlign = "center";
  let textColor = "black";
  ctx.fillStyle = "red";
  if (intensity < 50) {
    ctx.fillStyle = "green";
    textColor = "white";
  } else if (intensity < 150) {
    ctx.fillStyle = "lightgreen";
  } else if (intensity < 150) {
    ctx.fillStyle = "yellow";
  } else if (intensity < 250) {
    ctx.fillStyle = "orange";
  }

  ctx.fillRect(0, 0, 300, 300);
  ctx.fillStyle = textColor;
  ctx.fillText(intensity, 48, 78);

  // Chrome needs this to be a square of a particular size
  // 96x96 works
  const imageData = ctx.getImageData(0, 0, 96, 96);
  browser.browserAction.setIcon({ imageData });
  browser.browserAction.setTitle({
    title: `Current carbon intensity - ${intensity} gCO2/kWh`,
  });

  // Update in 30 minutes
  setTimeout(() => {
    getIntensity().then(render);
  }, 1000 * 60 * 60 * 30);
};

// Navigate to the carbon intensity site on click
browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({
    url: "https://carbonintensity.org.uk/",
  });
});

getIntensity().then(render);
