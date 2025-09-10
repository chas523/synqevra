//default RuleChain template for medical data processing
export const defaultRuleChainTemplate = {
  version: 1,
  firstNodeIndex: 0,
  nodes: [
    {
      type: "org.thingsboard.rule.engine.filter.TbJsFilterNode",
      name: "Temp > 39.2°C?",
      debugSettings: {
        failuresEnabled: false,
        allEnabled: false,
        allEnabledUntil: 0,
      },
      singletonMode: false,
      queueName: "Main",
      configurationVersion: 0,
      configuration: {
        scriptLang: "JS",
        jsScript: "return Number(msg.temperature) > 39.2;",
        tbelScript: null,
      },
      externalId: null,
      additionalInfo: {
        description: null,
        layoutX: 100,
        layoutY: 200,
      },
    },
    {
      type: "org.thingsboard.rule.engine.transform.TbTransformMsgNode",
      name: "Convert to FHIR",
      debugSettings: {
        failuresEnabled: false,
        allEnabled: false,
        allEnabledUntil: 0,
      },
      singletonMode: false,
      queueName: "Main",
      configurationVersion: 0,
      configuration: {
        scriptLang: "JS",
        jsScript: `
          var value = Number(msg.temperature);

          var observation = {
            resourceType: "Observation",
            status: "final",
            category: [
              {
                coding: [
                  {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "8310-5",
                  display: "Body temperature"
                }
              ],
              text: "Body Temperature"
            },
            subject: {
              reference: "Patient/9a7abe18-d6e4-4335-b636-6af8533b7367",
              display: "homer"
            },
            effectiveDateTime: "2011-11-11T13:12:12",
            note: [
              {
                text: "aaa note"
              }
            ],
            valueQuantity: {
              value: value,
              unit: "°C",
              system: "http://unitsofmeasure.org",
              code: "Cel"
            }
          };

          return {
            msg: observation,
            metadata: metadata,
            msgType: msgType
          };
          `,
        tbelScript: "return {msg: msg, metadata: metadata, msgType: msgType};",
      },
      externalId: null,
      additionalInfo: {
        description: null,
        layoutX: 300,
        layoutY: 200,
      },
    },
    {
      type: "org.thingsboard.rule.engine.rest.TbRestApiCallNode",
      name: "POST to Medplum",
      debugSettings: {
        failuresEnabled: false,
        allEnabled: false,
        allEnabledUntil: 0,
      },
      singletonMode: false,
      queueName: "Main",
      configurationVersion: 3,
      configuration: {
        restEndpointUrlPattern:
          "http://host.docker.internal:8103/fhir/R4/Patient/34235d7e-71e8-4dff-bb4c-67f2020101e1",
        requestMethod: "POST",
        useSimpleClientHttpFactory: false,
        parseToPlainText: false,
        ignoreRequestBody: true,
        enableProxy: null,
        useSystemProxyProperties: null,
        proxyScheme: null,
        proxyHost: null,
        proxyPort: null,
        proxyUser: null,
        proxyPassword: null,
        readTimeoutMs: null,
        maxParallelRequestsCount: null,
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6Ijk4YzNhOTUxLWE2YjgtNDQzNy1hNWZlLWYzOTE2Y2FhMDg3NyIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiI4ODczMmI4Zi0yODkxLTQ1ZTUtYTBmZi00OGU3N2JmYzdjM2YiLCJsb2dpbl9pZCI6Ijk3MjJmNDVmLTNiYWQtNDU5YS04OGU4LWQ1ODk1Y2E4OGQ5OCIsInN1YiI6Ijg4NzMyYjhmLTI4OTEtNDVlNS1hMGZmLTQ4ZTc3YmZjN2MzZiIsInVzZXJuYW1lIjoiODg3MzJiOGYtMjg5MS00NWU1LWEwZmYtNDhlNzdiZmM3YzNmIiwic2NvcGUiOiJvcGVuaWQiLCJwcm9maWxlIjoiQ2xpZW50QXBwbGljYXRpb24vODg3MzJiOGYtMjg5MS00NWU1LWEwZmYtNDhlNzdiZmM3YzNmIiwiaWF0IjoxNzU2OTI0NzIzLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgxMDMvIiwiYXVkIjoiODg3MzJiOGYtMjg5MS00NWU1LWEwZmYtNDhlNzdiZmM3YzNmIiwiZXhwIjoxNzU2OTI4MzIzfQ.7h83A8pRFRhlICo5rDM_7UeNarYLrhlS_iSjfDxSpNCxJ6vq9_9jeQFGkHeUBHoGpTPsE9nRQB_RBN-ug5eELg",
        },
        credentials: {
          type: "anonymous",
        },
        maxInMemoryBufferSizeInKb: 256,
      },
      externalId: null,
      additionalInfo: {
        description: null,
        layoutX: 500,
        layoutY: 200,
      },
    },
    {
      type: "org.thingsboard.rule.engine.action.TbLogNode",
      name: "Log incoming data",
      debugSettings: {
        failuresEnabled: false,
        allEnabled: false,
        allEnabledUntil: 0,
      },
      singletonMode: false,
      queueName: "Main",
      configurationVersion: 0,
      configuration: {
        scriptLang: "JS",
        jsScript:
          "return '\\nIncoming message:\\n' + JSON.stringify(msg) + '\\nIncoming metadata:\\n' + JSON.stringify(metadata);",
        tbelScript: "return 'Incoming message: ' + JSON.stringify(msg);",
      },
      externalId: null,
      additionalInfo: {
        description: null,
        layoutX: 700,
        layoutY: 200,
      },
    },
  ],
  connections: [
    {
      fromIndex: 0,
      toIndex: 1,
      type: "True",
    },
    {
      fromIndex: 1,
      toIndex: 2,
      type: "Success",
    },
    {
      fromIndex: 2,
      toIndex: 3,
      type: "Success",
    },
  ],
  ruleChainConnections: null,
};
