const cheerio = require('cheerio');
const request = require('request');
const rp = require('request-promise');
const fs = require('fs');

async function loadRequests() {
    let returnMe = [];
    try {
        for (let l = 1; l <= 15; l++) {
            console.log('=======================')
            console.log(`Page ${l}`)
            const html = await rp(`https://www.venuerific.com/sg/search?page=${l}&search%5Bcountry%5D=sg&search%5Bevent_types_supported%5D=&search%5Bvenue_type%5D=#`)
            const $ = cheerio.load(html);
            const articleArray = $(".venues-list article")
            for (let i = 0; i <= articleArray.length - 1; i++) {
                console.log(`Venue ${i}`)
                let article = articleArray[i]
                let details = $(article).find('.details')
                const image = details.find(".image img").attr('src')
                const tagline = details.find(".title h3").text().trim()
                const location = details.find(".title p").text().trim()
                let eventType = details.find(".meta .venue-type").text().trim().split(',')
                let description;
                eventType = eventType.map((element) => {
                    return element.trim()
                })

                const descriptionLink = details.find(".description p a").attr('href')

                // console.log(descriptionLink)
                if (descriptionLink) {
                    const venuePage = await rp(`https://www.venuerific.com${descriptionLink}`)
                    const venueHtml = cheerio.load(venuePage);

                    description = venueHtml(".description-content").first().first().text().trim()

                } else {
                    description = details.find(".description p").text().trim()
                    console.log()
                }
                let arrayToPush = {
                    "image": image,
                    "tagline": tagline,
                    "location": location,
                    "eventType": eventType,
                    "description": description,
                }

                returnMe.push(arrayToPush)
            }
        }
        fs.writeFile('./venues.json', JSON.stringify(returnMe), function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });

    }
    catch (err) {
        console.log(err)
    }
}


loadRequests()