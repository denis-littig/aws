const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const fetch = require('node-fetch');

let body;
let statusCode = 200;
const headers = {
    "Content-Type": "application/json"
};

async function insertlead(json) {
    let emailFull = JSON.stringify(json.clientProfileData.email);
    let email = emailFull.split('-')[0].substring(1);
    let lead = {
        name: json.clientProfileData.firstName,
        email: email,
        phone: json.clientProfileData.phone,
        type: "cliente"
    };

    await dynamo
    .put({
            TableName: "http-hiringcoders-leads",
            Item: {
                email: lead.email,
                name: lead.name,
                phone: lead.phone,
                type: "cliente",
                dataCliente: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
            }
        })
        .promise();
    body = `Posted lead ${lead.email}`;
}

exports.handler = async(event, context) => {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "X-VTEX-API-AppKey": "",
            "X-VTEX-API-AppToken": ""
        }
    };
    
    let requestJSON = JSON.parse(event.body);
    let url = `https://hiringcoders202104.myvtex.com/api/oms/pvt/orders/${requestJSON.OrderId}`;

    await fetch(url, options)
        .then(res => res.json())
        .then(json => insertlead(json))
        .catch(err => console.error('error:' + err));
    
    body = JSON.stringify(body);
    
    return {
        statusCode
    };
};