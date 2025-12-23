export const HL7_CONTROL_CHARS = {
  //sb (0x0B)
  START_BLOCK: '\x0b',
  //eb (0x1C)
  END_BLOCK: '\x1c',
  //cr (0x0D)
  CARRIAGE_RETURN: '\r',
} as const;

export const HL7_ACK_CODES = {
  AA: 'AA',
  AE: 'AE',
  AR: 'AR',
  CA: 'CA',
  CE: 'CE',
  CR: 'CR',
} as const;

export function buildFallbackAck(ackCode: string = HL7_ACK_CODES.AE): string {
  const { START_BLOCK, END_BLOCK, CARRIAGE_RETURN } = HL7_CONTROL_CHARS;
  return `${START_BLOCK}MSA|${ackCode}|1${CARRIAGE_RETURN}${END_BLOCK}${CARRIAGE_RETURN}`;
}
