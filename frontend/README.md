
# Medplum x Thingsboard Documentation (Frontend App)

  

Below there’s a detailed description of the application in current state (current state of an integration between Medplum and Thingsboard platform).

## Project structure tree

Folders in between dashes are not developed anymore. They've been developed previously by the developer that's not responsible for the project anymore.

**(auth)/login** folder represents subpage with login form (log in with thingsboard tenant account).

**Mock** folder represents subpage which allows to simulate iot devices - and send example data to thingsboard api.

**Observations** folder represents subpage to fetch and view 'observation' objects from Medplum.

The main functionality is located in '**rulechain'** folder.
Rulechain folder is responsible for creating rulechains, medplum authorization. It nests **[id]** folder which is responsible for creating the 'core' of rulechain - rulechain body.

```sh
└── src
    ├── app
    │   ├── (auth)/login
    │   │   ├── actions.ts
    │   │   └── page.tsx
    ----------------------
    │   ├── assets
    │   ├── dashboard
    │   │   └── ....tsx
    │   ├── medplum
    │   │   └── ....tsx
    -----------------------
    │   ├── home
    │   │   └── page.ts
    │   ├── mock
    │   │   ├── actions.ts
    │   │   └── page.tsx
    │   ├── observations
    │   │   └── page.tsx
    │   ├── rulechain
    │   │   ├── [id]
    │   │   │   ├── actions.ts
    │   │   │   └── page.tsx
    │   │   ├── components
    │   │   │   ├── AuthenticationSection.tsx
    │   │   │   ├── CreateRuleChainSection.tsx
    │   │   │   ├── defaultRuleChainTemplate.tsx
    │   │   │   ├── FlowChartEditor.tsx
    │   │   │   ├── MetadataSummary.tsx
    │   │   │   ├── NodeConfigurationEditor.tsx
    │   │   │   ├── NodesList.tsx
    │   │   │   ├── RuleChainAdvancedView.tsx
    │   │   │   ├── RuleChainBasicView.tsx
    │   │   │   ├── RuleChainHeader.tsx
    │   │   │   └── RuleChainList.tsx
    │   │   ├── hooks
    │   │   │   └── useAuth.ts
    │   │   ├── types
    │   │   │   ├── NodeTypes.ts
    │   │   │   └── RuleChainTypes.ts
    │   │   └── utils
    │   │       ├── index.ts
    │   │       ├── actions.ts
    │   │       └── page.tsx
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components
    │   └── ui
    │       ├── layout-wrapper.tsx
    │       ├── mqtt-form.tsx
    │       ├── post-form.tsx
    │       ├── sidebar.tsx
    │       └── table-rows.tsx
    ├── lib
	│   ├── utils.ts
    │   └── medplum.ts
    └── middleware.ts
```
  Each view folder consists of two subfolders:
  - page.tsx - main _client side_ view component
  - actions.ts - _server side_ file with actions method (api call etc.)

## Thingsboard API:
The integration was created using thingsboard’s available swagger documentation:
[http://localhost:8088/swagger-ui/index.html](http://localhost:8088/swagger-ui/index.html)

It's also possible to use Medplum SDK (which is used in /lib/medplum.ts folder): 
``` js 
import { MedplumClient } from  "@medplum/core";
export  const  medplum  =  new  MedplumClient({
	baseUrl:  process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL,
});
```
Which converts the necessity to call an api manually. It's used to log user in, and fetch observations directly from Medplum. 
**It's not** meant to be used in thingsboard rulechains (described below). Rule chain 'REST Api Call' nodes have to be configured manually - so it's impossible to use SDK there.  
## Rule Engine

The team decided to use thingsboard rule engine.

**Rule engine** is a tool to create rulechains. Rulechain is a structure of specific nodes and connections between them, which allow the telemetry data (and more) to be captured, modified and sent to an external api.

You can preview how rule engine works in Thingsboard UI:
- RuleChain can be created after visiting [http://localhost:8088/ruleChains](http://localhost:8088/ruleChains) (thingsboard UI)
- Then ruleChain body can be created after entering created Rulechain.

We've used the same idea (endpoints from swagger):
- **POST** /api/ruleChain - create Rulechain-   [Example body](#api-rulechain-create-example-body)
- **POST** /api/ruleChain/metadata{updateRelated} - fulfill Rulechain body - [Example body](#api-rulechain-metadata-example-body)

Left side - Thingsboard editor, right side - our editor
![RuleChain view](https://i.imgur.com/3NRlwDw.png)

The idea was to present an use case as follows:
1. Send telemetry data from example device with POST /api/v1/{deviceToken}/telemetry
**Inside rulechain (inside Thingsboard):**
2. Set threshold of temperature (filter node)
3. Convert data to FHIR format (transform node)
4. Send data to Medplum (Rest Api Call node)
**EXIT**
5. Display data in medplum (observations tab)

Use case is presented in flowchart below:
![use case flowchart](https://i.imgur.com/0pLI7wT.png) 

### How the Rule Chain logic works:
Each tenant has it's own rule chain set. There's one Root Rule Chain which aggregates all traffic. It's created by default.
After creating new RuleChain there are a couple of steps to follow to make it "Active". It's needed to connect it to the leaf of Root Rule Chain.
Inside the Root Rule Chain we're connecting our newly created rulechains at the end of "post telemetry" subtree. By doing this we allow all the "telemetry" traffic to be passed through Root Rule Chain into newly created rule chains.

The logic of important functions:
### createRuleChain()
1. Fill the form with [Example body](#api-rulechain-create-example-body)
2. Fetch all ruleChains
3. Filter the root rulechain
4. Fetch root rule chain metadata with ```GET /api/ruleChain/metadata```
5. Add new node to Root Rulechain metadata (newly created Rulechain)
6. Add new connection from index 0 (that's the index of last leaf of 'telemetry' subtree - to which we're going to add all newly created ruleChains) to index ```rootMetadata.nodes.length``` - the last index.
7. ```POST/api/ruleChain/metadata``` with newly connected rulechain

### updateRuleChainMetadata()

In the [Example body](#api-rulechain-metadata-example-body)  below you'll see the exact body that worked for use case that was tested. 3 nodes. Filter -> Transform -> Api Call.

1. Use the graphic dashboard to select nodes (basic tab) or edit raw json (advanced tab)
2. In basic tab - select nodes and edit them. The  [Example body](#api-rulechain-metadata-example-body) will be created automatically.
- After selecting Filter node - custom temperature threshold would be present.
- After selecting Transform Node (and logging into Medplum via medplum auth form present in /ruleChain tab) - there will be an option to pick a Medplum Patient that'd be a subject of an Observation. Transform node has default body that converts value to FHIR Observation format.
- After selecting Rest Api Call Node (and logging into Medplum via medplum auth form present in /ruleChain tab) - Authorization Property in Request Headers would be filled with Medplum Access Token. 
 
3. Validate the metadata - track```firstNodeIndex``` value - responsible for 1st connection - it gets removed every update, so we're updating it manually to '0'.
5. Increment ```version``` property. Without incrementing ```version` we may expect 409 Error.
6.  Click ACCEPT button - triggers```POST /api/ruleChain/metadata```
7. Rule Chain metadata is saved.

### Test the Rule Chain

You can check how it got created inside thingsboard UI at http://localhost:8088/ruleChains 

To test the RuleChain go to http://localhost:3000/mock and send telemetry data (like a temperature) that'd match your rule chain settings. 

After sending data go to http://localhost:3000/observations and preview new observation. 
The detailed screen of observations tab is not present. For this please visit http://localhost:3001/Observation - which is Medplum UI.

If the observation is not present you should check for the correctness of your rule chain.
There's an option to debug the dataflow in thingsboard UI. 
1. Go to http://localhost:8088/ruleChains/{id}.
2. Open the Rest Api Call (or other) node.
3. Click on Debug button ("Disabled").
4. Enable "All messages for 15 min" and Apply on Node.
5. Apply on RuleChain editor view
6. POST telemetry. Go to previously selected node, to "Events" tab. Preview the error messages.

#### Api Rulechain Create example body
```sh
{
"name": "Temperature Medplum RuleChain",
"type": "CORE",
"debugMode": true
}
```
#### Api Rulechain Metadata example body

```sh
{
  "ruleChainId": {
    "entityType": "RULE_CHAIN",
    "id": "e0b26790-8fbb-11f0-b176-013937f3fa08"
  },
  "version": 1,
  "firstNodeIndex": 0,
  "nodes": [
    {
      "id": {
        "entityType": "RULE_NODE",
        "id": "49d89640-8fbc-11f0-b176-013937f3fa08"
      },
      "createdTime": 1757669930404,
      "ruleChainId": {
        "entityType": "RULE_CHAIN",
        "id": "e0b26790-8fbb-11f0-b176-013937f3fa08"
      },
      "type": "org.thingsboard.rule.engine.filter.TbJsFilterNode",
      "name": "Temp > 36.6°C?",
      "debugSettings": {
        "failuresEnabled": false,
        "allEnabled": false,
        "allEnabledUntil": 0
      },
      "singletonMode": false,
      "queueName": "Main",
      "configurationVersion": 0,
      "configuration": {
        "scriptLang": "JS",
        "jsScript": "return msg.temperature > 36.6;",
        "tbelScript": null
      },
      "externalId": null,
      "additionalInfo": {
        "description": null,
        "layoutX": 100,
        "layoutY": 200
      }
    },
    {
      "id": {
        "entityType": "RULE_NODE",
        "id": "49d90b70-8fbc-11f0-b176-013937f3fa08"
      },
      "createdTime": 1757669930406,
      "ruleChainId": {
        "entityType": "RULE_CHAIN",
        "id": "e0b26790-8fbb-11f0-b176-013937f3fa08"
      },
      "type": "org.thingsboard.rule.engine.transform.TbTransformMsgNode",
      "name": "convert to fhir",
      "debugSettings": {
        "failuresEnabled": false,
        "allEnabled": false,
        "allEnabledUntil": 0
      },
      "singletonMode": false,
      "queueName": "Main",
      "configurationVersion": 0,
      "configuration": {
        "scriptLang": "JS",
        "jsScript": "\nvar value = Number(msg.temperature);\n\nvar observation = {\n  resourceType: \"Observation\",\n  status: \"final\",\n  category: [\n    {\n      coding: [\n        {\n          system: \"http://terminology.hl7.org/CodeSystem/observation-category\",\n          code: \"vital-signs\",\n          display: \"Vital Signs\"\n        }\n      ]\n    }\n  ],\n  code: {\n    coding: [\n      {\n        system: \"http://loinc.org\",\n        code: \"8310-5\",\n        display: \"Body temperature\"\n      }\n    ],\n    text: \"Body Temperature\"\n  },\n  subject: {\n    reference: \"Patient/9e45654d-a0d6-4115-b910-0cd19b28200f\",\n    display: \"linda johnson\"\n  },\n  effectiveDateTime: \"2011-11-11T13:12:12\",\n  note: [\n    {\n      text: \"aaa note\"\n    }\n  ],\n  valueQuantity: {\n    value: value,\n    unit: \"°C\",\n    system: \"http://unitsofmeasure.org\",\n    code: \"Cel\"\n  }\n};\n\nreturn {\n  msg: observation,\n  metadata: metadata,\n  msgType: msgType\n};\n          ",
        "tbelScript": "return {msg: msg, metadata: metadata, msgType: msgType};"
      },
      "externalId": null,
      "additionalInfo": {
        "description": null,
        "layoutX": 300,
        "layoutY": 200
      }
    },
    {
      "id": {
        "entityType": "RULE_NODE",
        "id": "49d980a0-8fbc-11f0-b176-013937f3fa08"
      },
      "createdTime": 1757669930410,
      "ruleChainId": {
        "entityType": "RULE_CHAIN",
        "id": "e0b26790-8fbb-11f0-b176-013937f3fa08"
      },
      "type": "org.thingsboard.rule.engine.rest.TbRestApiCallNode",
      "name": "POST to Medplum",
      "debugSettings": {
        "failuresEnabled": false,
        "allEnabled": false,
        "allEnabledUntil": 0
      },
      "singletonMode": false,
      "queueName": "Main",
      "configurationVersion": 3,
      "configuration": {
        "restEndpointUrlPattern": "http://host.docker.internal:8103/fhir/R4/Observation",
        "requestMethod": "POST",
        "useSimpleClientHttpFactory": false,
        "parseToPlainText": false,
        "ignoreRequestBody": false,
        "enableProxy": null,
        "useSystemProxyProperties": null,
        "proxyScheme": null,
        "proxyHost": null,
        "proxyPort": null,
        "proxyUser": null,
        "proxyPassword": null,
        "readTimeoutMs": null,
        "maxParallelRequestsCount": null,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImY2NWViNWQyLWE2MzgtNGNlZC05ZWE2LTI2OGQyNWIwNzkzMSIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6IjA3ZWRlMDQ5LTA1ZjAtNDhjYi1hM2RiLTcyZTQzNDExMjE0MyIsInN1YiI6IjdiYzMwMzJiLTVhZWYtNDc0Yi1hM2YwLTgwODcwZDA3NGNkNCIsInVzZXJuYW1lIjoiN2JjMzAzMmItNWFlZi00NzRiLWEzZjAtODA4NzBkMDc0Y2Q0Iiwic2NvcGUiOiJvcGVuaWQgb2ZmbGluZV9hY2Nlc3MiLCJwcm9maWxlIjoiUHJhY3RpdGlvbmVyLzAzYjc2ZDMyLTUzYTctNDUzMi1hMTk2LTZjNDRkODZlMjQ5ZCIsImlhdCI6MTc1NzY2OTcwNiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MTAzLyIsImV4cCI6MTc1NzY3MzMwNn0.3LBJpAgeXyWOx4XwO-fYHfO7uURkuGMC6nAmOWS5RZ0DUyIMOQS6HxZ7DORTHdLOPjBdbYmT4YRAPVPbb6YdGA"
        },
        "credentials": {
          "type": "anonymous"
        },
        "maxInMemoryBufferSizeInKb": 256
      },
      "externalId": null,
      "additionalInfo": {
        "description": null,
        "layoutX": 500,
        "layoutY": 200
      }
    }
  ],
  "connections": [
    {
      "fromIndex": 0,
      "toIndex": 1,
      "type": "True"
    },
    {
      "fromIndex": 1,
      "toIndex": 2,
      "type": "Success"
    }
  ],
  "ruleChainConnections": null
}```