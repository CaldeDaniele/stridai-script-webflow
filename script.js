var dict = {
  "#030303": "-primary-0",
  "#001d34": "-primary-10",
  "#003356": "-primary-20",
  "#004a79": "-primary-30",
  "#00629f": "-primary-40",
  "#2b7bbd": "-primary-50",
  "#4c95d8": "-primary-60",
  "#69b0f5": "-primary-70",
  "#9bcbff": "-primary-80",
  "#d0e4ff": "-primary-90",
  "#e9f1ff": "-primary-100",
  "#F5F9FF": "-primary-110",
  "#fbfdfe": "-primary-120",
  "#050505": "-secondary-0",
  "#0f1d2a": "-secondary-10",
  "#243240": "-secondary-20",
  "#3b4857": "-secondary-30",
  "#526070": "-secondary-40",
  "#6b7889": "-secondary-50",
  "#8492a3": "-secondary-60",
  "#9facbf": "-secondary-70",
  "#bac8db": "-secondary-80",
  "#d6e4f7": "-secondary-90",
  "#e9f0ff": "-secondary-100",
  "#f5f8ff": "-secondary-110",
  "#fbfcfe": "-secondary-120",
  "#080808": "-tertiary-0",
  "#241532": "-tertiary-10",
  "#3a2a48": "-tertiary-20",
  "#514060": "-tertiary-30",
  "#695779": "-tertiary-40",
  "#837093": "-tertiary-50",
  "#9d89ae": "-tertiary-60",
  "#b9a3c9": "-tertiary-70",
  "#d5bee5": "-tertiary-80",
  "#f0dbff": "-tertiary-90",
  "#faecff": "-tertiary-100",
  "#fff5fd": "-tertiary-110",
  "#fcfcfd": "-tertiary-120",
  "#0a0a0a": "-error-0",
  "#410002": "-error-10",
  "#690005": "-error-20",
  "#93000a": "-error-30",
  "#ba1a1a": "-error-40",
  "#de3730": "-error-50",
  "#ff5449": "-error-60",
  "#ff897d": "-error-70",
  "#ffb4ab": "-error-80",
  "#ffdad6": "-error-90",
  "#ffedea": "-error-100",
  "#fffafa": "-error-110",
  "#fcfcfc": "-error-120",
};

var dictRgb = {};
var isFirstTime = true;

function getElementsByIds(...ids) {
  return ids.map((id) => document.getElementById(id));
}

function fadeOut(elementId, duration = 1000) {
  const element = document.getElementById(elementId);
  let opacity = 1;
  const interval = 10;
  const step = interval / duration;

  const fade = setInterval(() => {
    if (!!element && !!element.style && !!element.style.opacity) {
      if (opacity <= 0) {
        clearInterval(fade);
        element.style.display = "none";
      }
      element.style.opacity = opacity;
      opacity -= step;
    }
  }, interval);
}

function hexToRgb(hex) {
  if (hex.includes("rgb")) return hex;
  if (hex.includes("rgba")) return hex;
  hex = hex.replace(/^#/, "");
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return `rgb(${r}, ${g}, ${b})`;
}

const replacePalette = () => {
  try {
    var keys = Object.values(window.getComputedStyle($("html").get(0)));
    var filteredKeys = keys.filter(function (key) {
      return key.indexOf("color") > -1;
    });

    const theme = isDark ? "dark" : "light";
    const oppositeTheme = isDark ? "light" : "dark";
    var colorsToChange = Object.values(dictRgb).map(
      (c) => c[oppositeTheme + "Rgb"],
    );

    if (isFirstTime) {
      colorsToChange = Object.values(dictRgb).map((c) => c.originalRgb);
      isFirstTime = false;
    }

    const newColors = Object.values(dictRgb).map((c) => c[theme + "Rgb"]);
    const basicColors = [hexToRgb("#000"), hexToRgb("#fff")];

    var newDict = {};

    Object.entries(dict).forEach(([key, value]) => {
      newDict[newColors[colorsToChange.indexOf(hexToRgb(key))]] = value;
    });

    dict = newDict;

    $("*").each(function (index, element) {
      filteredKeys.forEach(function (key) {
        //skip #000 and #fff
        if (basicColors.includes($(element).css(key))) return;

        if (colorsToChange.includes($(element).css(key))) {
          $(element).css(
            key,
            newColors[colorsToChange.indexOf($(element).css(key))],
          );
        }
      });
    });
  } catch (ex) {
    console.error(ex);
  }
};

function calculateResolution(width, height) {
  let newWidth, newHeight;

  if (width > height) {
    newWidth = 512;
    newHeight = Math.round((512 * height) / width);
  } else {
    newHeight = 512;
    newWidth = Math.round((512 * width) / height);
  }

  //multiplier to return the image to the original size
  let multiplier;
  if (newWidth > newHeight) {
    multiplier = width / newWidth;
  } else {
    multiplier = height / newHeight;
  }

  return {
    width: newWidth,
    height: newHeight,
    multiplier: multiplier,
  };
}

const getColorPalette = (paletteVariant) => {
  const theme = isDark ? "dark" : "light";
  return jobJson.palette.palette[theme][paletteVariant];
};

const refreshNewJob = () => {
  try {
    var containerImages = getElementsByIds(
      "container-image",
      "container-image-2",
    );
    containerImages.forEach((containerImage) => {
      if (containerImage?.style)
        containerImage.style.backgroundImage =
          "url(" + jobJson.link_image + ")";
    });

    fadeOut("container-loader", 1000);
  } catch (error) {
    console.error(error);
  }

  dictRgb = {};
  isFirstTime = true;

  Object.entries(dict).forEach(([key, value]) => {
    dictRgb[key] = {
      original: value,
      originalRgb: hexToRgb(key),
      lightHex: jobJson.palette.palette.light[value],
      darkHex: jobJson.palette.palette.dark[value],
      lightRgb: hexToRgb(jobJson.palette.palette.light[value]),
      darkRgb: hexToRgb(jobJson.palette.palette.dark[value]),
    };
  });

  replacePalette();
};

const changeTheme = () => {
  isDark = !isDark;
  replacePalette();
};

var jobJson;
var isDark = false;

window.onload = async function () {
  try {
    var session = window.location.search.split("?session=")[1];
    if (!!session) {
      const containerLoader = document.getElementById("container-loader");
      containerLoader.style.display = "flex";
      containerLoader.style.opacity = 1;
    }
  } catch (error) {
    console.error(error);
  }

  //take ?session from url
  if (window.location.search) {
    //get job from session
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    try {
      const job = await fetch(
        "https://stridai-backend-nest-71a94d04a6b3.herokuapp.com/jobs/" +
          session,
        requestOptions,
      );
      if (job.status === 200) {
        try {
          jobJson = await job.json();
          refreshNewJob();
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  try {
    var submit = document.getElementById("prompt-submit");

    var darkButton = document.getElementById("dark-button");
    if (!!darkButton) {
      darkButton.addEventListener("click", async (event) => {
        event.preventDefault();
        changeTheme();
      });
    }

    if (!!submit) {
      submit.addEventListener("click", async function (event) {
        console.log("Clicco su bottone submit!!");

        const currentlySelected = document.querySelector(
          ".composition-lanscape-selected .composition-title",
        );
        const currentlyArtistSelected = document.querySelector(
          ".artist-selected .artist-real-name",
        );

        const prompt = document.getElementById("prompt-input");

        console.log("Artista: ", currentlyArtistSelected.textContent);
        console.log("Tipologia: ", currentlySelected.textContent);
        console.log("Prompt: ", prompt.value);

        event.preventDefault();

        //disable button and change text to Loading...
        submit.disabled = true;
        submit.innerHTML = "Loading...";
        submit.value = "Loading...";
        submit.style.backgroundColor = "#000";

        try {
          var myHeaders = new Headers();
          myHeaders.append("accept", "*/*");
          myHeaders.append("Content-Type", "application/json");
          const newResolution = calculateResolution(
            window.innerWidth,
            window.innerHeight,
          );

          const compositePrompt =
            currentlySelected.textContent.toLowerCase() +
            ", " +
            prompt.value.toLowerCase() +
            ", " +
            currentlyArtistSelected.textContent.toLowerCase() +
            " style";

          console.log("PROMPT: ", compositePrompt);
          var raw = JSON.stringify({
            prompt: compositePrompt,

            arguments: {
              width: newResolution.width,
              height: newResolution.height,
              hr_scale: newResolution.multiplier,
            },
          });

          var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
          };

          var response = await fetch(
            "https://stridai-backend-nest-71a94d04a6b3.herokuapp.com/jobs/create",
            requestOptions,
          ).then((response) => response.json());

          await new Promise((resolve) => setTimeout(resolve, 2000));

          //check every 500ms if response.link_image response is 200
          var interval = setInterval(async function () {
            const checkNewJob = await fetch(
              "https://stridai-backend-nest-71a94d04a6b3.herokuapp.com/jobs/" +
                response.id,
              {
                method: "GET",
              },
            );

            const checkNewJobJson = await checkNewJob.json();

            if (checkNewJob.status === 200 && checkNewJobJson.palette) {
              clearInterval(interval);
              interval = null;

              jobJson = checkNewJobJson;
              //change url to add ?session without reload
              window.history.pushState(
                {},
                "",
                "/home-page?session=" + response.id,
              );
              window.location.reload();

              /**refreshNewJob();

      submit.disabled = false;
      submit.innerHTML = "Submit";
      submit.style.backgroundColor = "unset";
      submit.value = "Submit"; */
            }
          }, 750);
        } catch (error) {
          submit.disabled = false;
          submit.innerHTML = "Error, retry";
          submit.value = "Error, retry";
          submit.style.backgroundColor = "red";
          console.error(error);
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
};
