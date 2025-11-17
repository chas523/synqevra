export const SUPPORTED_ADT_TYPES = [
  'A01',
  'A02',
  'A03',
  'A04',
  'A05',
  'A06',
  'A07',
  'A08',
  'A09',
  'A10',
  'A11',
  'A12',
  'A13',
  'A14',
  'A15',
  'A16',
  'A17',
  'A18',
  'A21',
  'A22',
  'A23',
  'A25',
  'A26',
  'A27',
  'A28',
  'A29',
  'A31',
  'A32',
  'A33',
  'A34',
  'A35',
  'A36',
  'A37',
  'A38',
  'A39',
  'A40',
  'A41',
  'A42',
  'A43',
  'A44',
  'A45',
  'A46',
  'A47',
  'A48',
  'A49',
  'A50',
  'A51',
  'A52',
  'A53',
  'A54',
  'A55',
  'A60',
  'A61',
  'A62',
];

export function mapHL7PatientClassToFHIR(hl7Class: string): string {
  switch (hl7Class?.toUpperCase()) {
    case 'I':
      return 'IMP';
    case 'O':
      return 'AMB';
    case 'E':
      return 'EMER';
    case 'P':
      return 'AMB';
    case 'R':
      return 'AMB';
    case 'B':
      return 'OBSENC';
    case 'C':
      return 'AMB';
    case 'N':
      return 'AMB';
    case 'U':
      return 'AMB';
    case 'A':
      return 'AMB';
    case 'L':
      return 'AMB';
    case 'D':
      return 'AMB';
    case 'S':
      return 'AMB';
    case 'T':
      return 'AMB';
    case 'X':
      return 'AMB';
    default:
      return 'AMB';
  }
}

export function mapADTTypeToEncounterStatus(
  adtType: string,
):
  | 'planned'
  | 'arrived'
  | 'triaged'
  | 'in-progress'
  | 'onleave'
  | 'finished'
  | 'cancelled'
  | 'entered-in-error'
  | 'unknown' {
  switch (adtType) {
    case 'A01':
    case 'A04':
    case 'A06':
    case 'A07':
    case 'A10':
      return 'in-progress';

    case 'A02':
    case 'A08':
    case 'A17':
    case 'A22':
    case 'A54':
    case 'A61':
      return 'in-progress';

    case 'A03':
    case 'A09':
      return 'finished';

    case 'A05':
    case 'A14':
    case 'A15':
    case 'A16':
      return 'planned';

    case 'A21':
      return 'onleave';

    case 'A18':
    case 'A28':
    case 'A31':
    case 'A34':
    case 'A35':
    case 'A36':
    case 'A37':
    case 'A39':
    case 'A40':
    case 'A41':
    case 'A42':
    case 'A43':
    case 'A44':
    case 'A45':
    case 'A46':
    case 'A47':
    case 'A48':
    case 'A49':
    case 'A50':
    case 'A51':
    case 'A60':
      return 'in-progress';

    case 'A11':
    case 'A12':
    case 'A13':
    case 'A25':
    case 'A26':
    case 'A27':
    case 'A32':
    case 'A33':
    case 'A38':
    case 'A52':
    case 'A53':
    case 'A55':
    case 'A62':
      return 'cancelled';

    case 'A23':
    case 'A29':
      return 'entered-in-error';

    default:
      return 'unknown';
  }
}

export function mapAssigningAuthority(
  assigner: string | undefined,
  idTypeCode: string | undefined,
  organizationSystem: string,
): string {
  if (!assigner) {
    switch (idTypeCode?.toUpperCase()) {
      case 'MR':
        return `${organizationSystem}/mrn`;
      case 'SS':
      case 'SSN':
        return 'http://hl7.org/fhir/sid/us-ssn';
      case 'DL':
        return 'http://hl7.org/fhir/sid/us-drivers-license';
      case 'PPN':
        return 'http://hl7.org/fhir/sid/us-passport';
      case 'PI':
        return 'http://hl7.org/fhir/sid/us-medicare';
      default:
        return `${organizationSystem}/patients`;
    }
  }

  const parts = assigner.split('&');
  if (parts.length === 3) {
    const namespaceId = parts[0];
    const universalId = parts[1];
    const universalIdType = parts[2].toUpperCase();

    if (universalId && universalIdType === 'ISO') {
      return `urn:oid:${universalId}`;
    } else if (universalId && universalIdType === 'UUID') {
      return `urn:uuid:${universalId}`;
    } else if (namespaceId) {
      return `${organizationSystem}/${namespaceId.toLowerCase()}`;
    }
  }

  if (parts.length === 1) {
    const namespaceId = parts[0].trim();
    if (namespaceId) {
      const upperNamespaceId = namespaceId.toUpperCase();
      const knownNamespaces = ['UNCHCS', 'UNC', 'CALDWELL'];

      if (knownNamespaces.includes(upperNamespaceId)) {
        switch (idTypeCode?.toUpperCase()) {
          case 'MR':
            return `${organizationSystem}/mrn`;
          default:
            return `${organizationSystem}/patients`;
        }
      } else {
        const typeCode = idTypeCode || 'MR';
        switch (typeCode.toUpperCase()) {
          case 'MR':
            return `${organizationSystem}/mrn`;
          default:
            return `${organizationSystem}/patients`;
        }
      }
    }
  }

  return `${organizationSystem}/patients`;
}
