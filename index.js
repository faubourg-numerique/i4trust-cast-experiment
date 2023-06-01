const entityType = "WasteBiomass";

const iShareToolsForI4Trust = require("ishare-tools-for-i4trust");
const axios = require("axios").default;
const path = require("path");

require("dotenv").config({ path: [__dirname, ".env"].join(path.sep) });

async function main() {
    let config, url, accessToken, response;

    console.log("Generating iShare JWT...");

    config = {
        issuer: process.env.PYROLYSIS_PLANT_IDENTIFIER,
        subject: process.env.PYROLYSIS_PLANT_IDENTIFIER,
        audience: process.env.BIOMASS_PROVIDER_IDENTIFIER,
        x5c: [process.env.PYROLYSIS_PLANT_X5C_1, process.env.PYROLYSIS_PLANT_X5C_2, process.env.PYROLYSIS_PLANT_X5C_3],
        privateKey: process.env.PYROLYSIS_PLANT_PRIVATE_KEY
    };

    const iShareJWT = iShareToolsForI4Trust.generateIShareJWT(config);

    console.log("OK\n");

    console.log("Requesting access token...");

    config = {
        arTokenURL: process.env.BIOMASS_PROVIDER_AR_TOKEN_URL,
        clientId: process.env.PYROLYSIS_PLANT_IDENTIFIER,
        iShareJWT: iShareJWT
    };

    try {
        accessToken = await iShareToolsForI4Trust.getAccessToken(config);
    } catch (error) {
        console.log("Failed\n");
        return;
    }

    console.log("OK\n");

    console.log("Requesting context broker through api gateway...");

    url = `${process.env.BIOMASS_PROVIDER_API_GATEWAY_URL}/ngsi-ld/v1/entities?type=${entityType}`

    config = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    try {
        response = await axios.get(url, config);
    } catch (error) {
        console.log("Failed\n");
        console.log(error.response.data);
        return;
    }

    console.log("OK\n");

    console.log(response.data);
}

main();
