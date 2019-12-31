const puppeteer = require("puppeteer");
const request = require("request");
const fs = require("fs");

//Database
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("iptorrents.json");
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({
  movies: []
}).write();

const imageResults = [];
const movies = [];
const imageCounts = [];

const waitTime = (timeout = 500) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

const imageDownload = async (uri, folder, filename, callback) => {
  if (!fs.existsSync(`images_test`)) {
    fs.mkdirSync(`images_test`);
  }

  if (!fs.existsSync(`images_test/${folder}`)) {
    fs.mkdirSync(`images_test/${folder}`);
  }

  if (fs.existsSync(`images_test/${folder}/${filename}`)) {
    return;
  }

  await waitTime();
  console.log("requesting image ", folder, filename);
  request.head(uri, (err, res, body) => {
    request(uri)
      .pipe(fs.createWriteStream(`images_test/${folder}/${filename}`))
      .on("close", callback);
  });
};

const getElementData = async (element, page, exclude = null, index = -1) => {
  //return new Promise(async resolve => {
  try {
    if (await elementExists(element, page)) {
      const eleData = await page.evaluate(
        ({ element, exclude, index }) => {
          if (index !== -1) {
            return $(element)[index].textContent;
          }
          return exclude
            ? $(element)
                .not(exclude)
                .html()
            : $(element).html();
        },
        { element, exclude, index }
      );
      return eleData;
      //resolve(eleData);
    }
  } catch (e) {
    console.log("getElementData error ", e);
    //  resolve(null);
  }
  // });
};

const ifElementExistsClick = (element, page, index = -1) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (await elementExists(element, page)) {
        await page.evaluate(
          ({ element, index }) =>
            index !== -1 ? $(element)[index].click() : $(element).click(),
          { element, index }
        );

        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
};

const elementExists = async (element, page) => {
  const pageEl = await page.$(element);
  if (pageEl !== null) {
    //console.log("element found " + element);
    return true;
  } else {
    //console.log("element not found " + element);
    return false;
  }
};

const writeRecord = async (title, uri) => {
  let item = db
    .get("movies")
    .find({ title: title })
    .value();
  if (!item) {
    console.log("new title ", title);
    db.get("movies")
      .push({
        title: title,
        uri: uri,
        images: []
      })
      .write();
  } else {
    console.log("title found already in db skipping ", title);
  }
};

const writeRecordImage = async (title, imageUri) => {
  let item = db
    .get("movies")
    .find({ title: title })
    .value();
  if (item) {
    let temp = item.images;
    temp.push({ uri: imageUri });
    item.images = temp;
    db.get("movies")
      .find({ title: title })
      .assign(item)
      .write();
  } else {
    console.log("image search title not found ", title);
  }
};

puppeteer
  .launch({
    headless: false,
    slowMo: 500, // slow down by 250ms
    devtools: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--user-agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.0 Safari/537.36'"
    ]
  })
  .then(async browser => {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1000
    });

    let index = 0;
    let totalCount = 1;

    try {
      // INIT
      await page.goto("https://www.iptorrents.com/t?8=&q=&qf=#torrents", {
        waitUntil: "networkidle0",
        timeout: 500000
      });

      const navigation = page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 50000
      });

      await page.waitForSelector(".username");

      await page.evaluate(() => $(".username").val("jasonbronson@gmail.com"));

      await page.evaluate(() => $(".password").val("adminj9687"));

      await page.evaluate(() => document.forms[0].submit());

      await page.waitForSelector("#torrents");

      for (let a = 316; a < 1774; a++) {
        console.log("page #", a);

        //force the location
        await page.goto("https://www.iptorrents.com/t?8;p=" + a + "#torrents", {
          waitUntil: "networkidle0",
          timeout: 500000
        });

        await page.waitForSelector("#torrents");

        let items = await page.evaluate(() =>
          Array.from(document.querySelectorAll("#torrents tr td .hv")).map(
            item => ({
              text: item.innerHTML,
              href: item.href
            })
          )
        );

        //Go through page of items here
        let title, images;

        for (let item in items) {
          //format the title to something easier to deal with
          title = items[item].text
            .trim()
            .split(" ")
            .join("_");

          console.log("title creation: ", title);

          //if it exists don't parse it again waste of time
          let dbitem = db
            .get("movies")
            .find({ title: title })
            .value();
          if (dbitem) {
            console.log("title found skipping");
            continue;
          }

          await page.goto(items[item].href, {
            waitUntil: "networkidle0",
            timeout: 500000
          });

          await page.waitForSelector(".desWrap");

          images = await page.evaluate(() =>
            Array.from(document.querySelectorAll(".desWrap img")).map(item => ({
              img: item.currentSrc
            }))
          );

          await writeRecord(title, items[item].href);
          for (let image in images) {
            console.log(images[image]);
            let temp = images[image];
            if (temp.img != "https://www.iptorrents.com/pic/notSSL.png") {
              //let filename = temp.img.substring(temp.img.lastIndexOf("/") + 1);
              //await imageDownload(temp.img, folder, filename, () => {});
              await writeRecordImage(title, temp.img);
              console.log("Image:", title, temp.img);
            } else {
              console.log("SkipImage: ", title, temp.img);
            }
          }
          console.log("** NEXT ITEM **");
          //console.log(items[item].text, items[item].href);
        }
      }
    } catch (e) {
      console.log(e);
    }
    //await browser.close();
  })
  .catch(function(error) {
    console.error("Error pulling data!", error);
    process.exit();
  });
