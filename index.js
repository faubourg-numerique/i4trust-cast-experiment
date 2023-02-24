const iShareToolsForI4Trust = require("ishare-tools-for-i4trust");
const axios = require("axios").default;

const {
    BIOMASS_PROVIDER_IDENTIFIER,
    BIOMASS_PROVIDER_AR_TOKEN_URL,
    BIOMASS_PROVIDER_AR_DELEGATION_URL,
    BIOMASS_PROVIDER_API_GATEWAY_URL,
    PYROLYSIS_PLANT_IDENTIFIER,
    PYROLYSIS_PLANT_X5C,
    PYROLYSIS_PLANT_PRIVATE_KEY,
} = require("./constants");

const DELEGATION_REQUEST = {
    delegationRequest: {
        policyIssuer: BIOMASS_PROVIDER_IDENTIFIER,
        target: {
            accessSubject: PYROLYSIS_PLANT_IDENTIFIER
        },
        policySets: [
            {
                policies: [
                    {
                        target: {
                            resource: {
                                type: "WasteBiomass",
                                identifiers: [
                                    "*"
                                ],
                                attributes: [
                                    "*"
                                ]
                            },
                            actions: [
                                "GET"
                            ]
                        },
                        rules: [
                            {
                                effect: "Permit"
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

async function main() {
    console.log("Generating iShare JWT...");

    var config = {
        issuer: PYROLYSIS_PLANT_IDENTIFIER,
        subject: PYROLYSIS_PLANT_IDENTIFIER,
        audience: BIOMASS_PROVIDER_IDENTIFIER,
        x5c: PYROLYSIS_PLANT_X5C,
        privateKey: PYROLYSIS_PLANT_PRIVATE_KEY
    };

    const iShareJWT = iShareToolsForI4Trust.generateIShareJWT(config);

    console.log("OK\n");

    console.log("Requesting access token...");

    var config = {
        arTokenURL: BIOMASS_PROVIDER_AR_TOKEN_URL,
        clientId: PYROLYSIS_PLANT_IDENTIFIER,
        iShareJWT: iShareJWT
    };

    const accessToken = await iShareToolsForI4Trust.getAccessToken(config);

    console.log("OK\n");

    console.log("Requesting delegation token...");

    var config = {
        arDelegationURL: BIOMASS_PROVIDER_AR_DELEGATION_URL,
        delegationRequest: DELEGATION_REQUEST,
        accessToken: accessToken
    };

    const delegationToken = await iShareToolsForI4Trust.getDelegationToken(config);

    console.log("OK\n");

    console.log("Requesting context broker through api gateway...");

    var url = BIOMASS_PROVIDER_API_GATEWAY_URL + "/ngsi-ld/v1/entities?type=WasteBiomass"

    var config = {
        headers: {
            Authorization: `Bearer ${delegationToken}`
        }
    };

    var response = await axios.get(url, config);
    var entities = response.data;

    console.log("OK\n");

    console.log(entities);
}

main();
