import { Hl7Message } from '@medplum/core';
import { HL7_CONTROL_CHARS, HL7_ACK_CODES } from '../constants/hl7.constants';

export type AckCode = 'AA' | 'AE' | 'AR' | 'CA' | 'CE' | 'CR';

export interface ErrorDetails {
  code: string;
  text: string;
  message?: string;
}

export function buildAck(
  hl7Message: Hl7Message,
  ackCode: AckCode,
  errorDetails?: ErrorDetails,
): string {
  const { START_BLOCK, END_BLOCK, CARRIAGE_RETURN } = HL7_CONTROL_CHARS;

  try {
    const ack = hl7Message.buildAck({ ackCode });
    const ackString = ack.toString();

    if (errorDetails && ackCode !== 'AA' && ackCode !== 'CA') {
      const errSegment = `ERR|^${errorDetails.code}^HL70357^${errorDetails.text}|${errorDetails.message || 'Unknown error'}|E|${errorDetails.code}^${errorDetails.text}^HL70357`;
      const ackWithErr = ackString + CARRIAGE_RETURN + errSegment;
      return `${START_BLOCK}${ackWithErr}${END_BLOCK}${CARRIAGE_RETURN}`;
    }

    return `${START_BLOCK}${ackString}${END_BLOCK}${CARRIAGE_RETURN}`;
  } catch {
    const controlId =
      hl7Message.getSegment('MSH')?.getField(10)?.toString() || '1';
    const fallbackAck = `MSH|^~\\&|||||||ACK||P|2.5${CARRIAGE_RETURN}MSA|${ackCode}|${controlId}`;
    return `${START_BLOCK}${fallbackAck}${END_BLOCK}${CARRIAGE_RETURN}`;
  }
}

export function buildFallbackHl7Message(rawMessage: string): Hl7Message {
  try {
    return Hl7Message.parse(rawMessage);
  } catch {
    const fallback = 'MSH|^~\\&|||||||ADT^A01||P|2.5';
    return Hl7Message.parse(fallback);
  }
}

export function determineErrorDetails(error: Error): {
  ackCode: AckCode;
  errorDetails: ErrorDetails;
} {
  let ackCode: AckCode = HL7_ACK_CODES.AE as AckCode;
  let errorCode = '207';
  let errorText = 'Application internal error';

  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();

  if (
    errorName === 'unsupportedmessagetypeerror' ||
    errorName === 'hl7parsingerror' ||
    errorMessage.includes('validation') ||
    errorMessage.includes('format') ||
    errorMessage.includes('unsupported') ||
    errorMessage.includes('parsing')
  ) {
    ackCode = HL7_ACK_CODES.AR as AckCode;
    errorCode = '204';
    errorText = 'Invalid message format or validation error';
  } else if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('network')
  ) {
    ackCode = HL7_ACK_CODES.CR as AckCode;
    errorCode = '203';
    errorText = 'System error or network timeout';
  } else if (
    errorMessage.includes('not found') ||
    errorMessage.includes('missing')
  ) {
    ackCode = HL7_ACK_CODES.AE as AckCode;
    errorCode = '205';
    errorText = 'Required data missing';
  }

  return {
    ackCode,
    errorDetails: {
      code: errorCode,
      text: errorText,
      message: error.message,
    },
  };
}
