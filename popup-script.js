// Allows this to work in Firefox (where "browser" is a thing) and
// Chrome (where "chrome" is a thing)
if (typeof browser === "undefined") {
  var browser = chrome;
}

const refreshInterval = 30 * 60 * 1000; // 30 minutes
let lastRefreshTime;
let lastTimer;
let fontCheck = 0;

// Call the api to get the current carbon intensity
const getIntensity = () =>
  fetch("https://api.carbonintensity.org.uk/regional/regionid/6")
    .then((resp) => resp.json())
    .then((x) => {
      if(!x || !x.data || !x.data[0] || !x.data[0].data || !x.data[0].data[0].intensity) {
        return false;
      }
      if(x.data[0].data[0].intensity.actual && x.data[0].data[0].intensity.actual !== "null"){
        return x.data[0].data[0].intensity.actual;
      }
      if(x.data[0].data[0].intensity.forecast && x.data[0].data[0].intensity.forecast !== "null") {
        return x.data[0].data[0].intensity.forecast;
      }
      return false;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });

// Render the image which is a number in a coloured box
const render = (intensity) => {

  // Wait until font actually loaded
  if (!document.fonts.check("bold 90px Just Another Hand")) {
    setTimeout(() => {
      render(intensity);
      return;
    }, 100);
  }

  lastRefreshTime = new Date();
  console.log(lastRefreshTime.toISOString() + ' - Updating icon with new intensity: ' + intensity);

  const ctx = document.getElementById("i").getContext("2d");
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
  } else if (intensity < 250) {
    ctx.fillStyle = "yellow";
  } else if (intensity < 350) {
    ctx.fillStyle = "orange";
  }

  ctx.fillRect(0, 0, 300, 300);
  ctx.fillStyle = textColor;
  ctx.fillText(intensity || "...", 48, 78);
};

getIntensity().then(render);
