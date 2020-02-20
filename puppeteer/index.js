//RUN THIS FILE BY ITSELF FROM COMMAND LINE
//EXAMPLE node index.js
const puppeteer = require("puppeteer");
const db = require("./db");
const dotenv = require("dotenv");
const cookies = require("./cookies.json");

const result = dotenv.config({ path: "./.env" });
//make sure env file data is read
if (result.error) {
  throw result.error;
}

const waitTime = (timeout = 500) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

const writeRecord = async (title, uri) => {
  if (title.length < 1 || uri.length < 1) {
    console.log("URI or title was not found skipping");
    return;
  }
  let item = await db.findByTitle(title);
  //console.log("Db Search Title: ", item);
  if (item == null || Object.keys(item).length == 0) {
    console.log("new record ", title);
    db.insert({ title: title, uri: uri });
  } else {
    console.log("record found already in db skipping ", title);
  }
};

const writeRecordImage = async (title, imageList) => {
  if (imageList.length > 0)
    await db.updateByTitle(title, { images: imageList });
};

puppeteer
  .launch({
    headless: false, //process.env.HEADLESS,
    slowMo: process.env.PUPPETEER_SPEED, // slow down by 250ms
    devtools: true,
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
      //read cookies from Chrome EditCookie export
      if (!cookies) {
        throw cookies.error;
      } else {
        await page.setCookie(...cookies);
        //const cookiesSet = await page.cookies(process.env.TORRENT_URL);
        //console.log(JSON.stringify(cookiesSet));
      }

      for (let a = 1; a < process.env.MAX_PAGES; a++) {
        console.log("page #", a);

        //force the location
        await page.goto(process.env.TORRENT_URL + ";p=" + a, {
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
          let dbitem = await db.findByTitle(title);
          console.log(dbitem);
          if (dbitem && Object.keys(dbitem).length > 1) {
            console.log("title found skipping ", dbitem);
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

          let imageList = [];
          for (let image in images) {
            let temp = images[image];
            console.log("IMAGE:", temp);
            if (temp.img != "https://www.iptorrents.com/pic/notSSL.png") {
              //let filename = temp.img.substring(temp.img.lastIndexOf("/") + 1);
              //await imageDownload(temp.img, folder, filename, () => {});
              imageList.push(temp.img);
            }
          }
          //write image list
          await writeRecordImage(title, imageList);
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
  });
