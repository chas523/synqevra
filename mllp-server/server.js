import { MLLPServer } from "mllp-node-sl7";
import dotenv from "dotenv";

dotenv.config();
//envs
//tenantId  - taken from db for specific client
const TENANT_ID = process.env.TENANT_ID;
const LISTEN_IP = process.env.LISTEN_IP || "127.0.0.1";
const LISTEN_PORT = Number(process.env.LISTEN_PORT || 56000);
const BACKEND_URL =
  process.env.BACKEND_URL || "http://backend:3003/fhir/hl7-decode";
const TIMEOUT = Number(process.env.MLLP_TIMEOUT || 600);

if (!TENANT_ID) {
  throw new Error("TENANT_ID is missing in environment variables!");
}

//server
const server = new MLLPServer(LISTEN_IP, LISTEN_PORT, console.log, TIMEOUT);

server.on("hl7", async (eventData) => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rawMessage: eventData.msg, tenantId: TENANT_ID }),
    });

    if (response.ok) {
      console.log("data sent to backend successfully\n===================\n");
      const responseData = await response.text();
      console.log(
        "backend response:\n",
        responseData,
        "\n===================\n"
      );
      eventData.ack = extractAckCode(responseData) || "AA";
      eventData.msg = responseData;
    } else {
      const errorData = await response.text();
      const errorJson = JSON.parse(errorData);
      console.error(
        "error sending to backend:",
        errorJson.message,
        "\n===================\n"
      );
      eventData.ack = "AE"; //application error
    }
  } catch (error) {
    console.error(
      "error connecting to backend:",
      error.message,
      "\n===================\n"
    );
    eventData.ack = "AE"; //application error
  }

  //send response back to HL7 provider
  server.response(eventData);
});

//server error handling
server.on("error", (error) => {
  console.error("MLLP server error:", error);
});

function extractAckCode(hl7Response) {
  const msaMatch = hl7Response.match(/MSA\|([A-Z]{2})\|/);
  return msaMatch ? msaMatch[1] : null;
}

console.log("MLLP server listening on localhost:56000");
console.log("data will be sent to:", BACKEND_URL);
