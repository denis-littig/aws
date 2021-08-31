const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async(event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    switch (event.routeKey) {

      case "DELETE /leads/{email}":
        await dynamo
          .delete({
            TableName: "http-hiringcoders-leads",
            Key: {
              email: event.pathParameters.email
            }
          })
          .promise();
        body = `Deleted lead ${event.pathParameters.email}`;
        break;

      case "GET /leads/{email}":
        body = await dynamo
          .get({
            TableName: "http-hiringcoders-leads",
            Key: {
              email: event.pathParameters.email
            }
          })
          .promise();
        break;

      case "GET /leads":
        body = await dynamo.scan({ TableName: "http-hiringcoders-leads" }).promise();
        break;

      case "POST /leads":
        let requestJSON = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: "http-hiringcoders-leads",
            Item: {
              email: requestJSON.email,
              name: requestJSON.name,
              phone: requestJSON.phone,
              type: requestJSON.type,
              dataProspecto: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
            },
            ConditionExpression: 'attribute_not_exists(email)',
          })
          .promise();
        body = `Posted lead ${requestJSON.email}`;
        break;

      case "PUT /leads/{email}":
        let requestJSONput = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: "http-hiringcoders-leads",
            Key: {
              email: event.pathParameters.email
            },
            Item: {
              email: requestJSONput.email,
              name: requestJSONput.name,
              phone: requestJSONput.phone,
              type: requestJSONput.type,
              dataCliente: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
            }
          })
          .promise();
        body = `Put lead ${requestJSONput.email}`;
        break;

      case "POST /submit":
        let requestJSONsub = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: "http-hiringcoders-leads",
            Item: {
              email: requestJSONsub.email,
              name: requestJSONsub.name,
              phone: requestJSONsub.phone,
              type: "Prospecto",
              dataProspecto: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
            },
            ConditionExpression: 'attribute_not_exists(email)',
          })
          .promise();
        body = `Posted lead ${requestJSON.email}`;
        break;
        
        case "GET /customers":
        await dynamo
          .query({
            TableName: "http-hiringcoders-leads",
            KeyConditionExpression: "#tp = :cccccc",
            ExpressionAttributeNames:{
                "#tp": "type"
            },
            ExpressionAttributeValues: {
        ":cccccc": "cliente"
        }
          })
          .promise();
        break;

      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  }
  catch (err) {
    statusCode = 400;
    body = err.message;
  }
  finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers
  };
};