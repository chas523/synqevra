// SMS Provider Types
export type SmsProviderType = 'AWS_SNS' | 'TWILIO' | 'SMPP';

// AWS SNS Config
export interface AwsSnsConfig {
    type: 'AWS_SNS';
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
}

// Twilio Config
export interface TwilioConfig {
    type: 'TWILIO';
    numberFrom: string;
    accountSid: string;
    accountToken: string;
}

// SMPP Bind Types
export type SmppBindType = 'TX' | 'RX' | 'TRX';

// SMPP Config
export interface SmppConfig {
    type: 'SMPP';
    protocolVersion: number;
    host: string;
    port: number;
    systemId: string;
    password: string;
    systemType?: string;
    bindType: SmppBindType;
    serviceType?: string;
    sourceAddress?: string;
    sourceTon: number;
    sourceNpi: number;
    destinationTon: number;
    destinationNpi: number;
    addressRange?: string;
    codingScheme: number;
}

// Union type for SMS config
export type SmsConfigJsonValue = AwsSnsConfig | TwilioConfig | SmppConfig;

// Entity ID (reused from general settings)
export interface EntityId {
    entityType: string;
    id: string;
}

// Tenant ID (reused from general settings)
export interface TenantId {
    entityType: string;
    id: string;
}

// SMS Settings DTO
export interface SmsSettings {
    id: EntityId;
    createdTime: number;
    tenantId: TenantId;
    key: string;
    jsonValue: SmsConfigJsonValue;
}

// Slack Config
export interface SlackConfig {
    botToken: string;
    method: 'SLACK';
}

// Mobile App Config
export interface MobileAppConfig {
    firebaseServiceAccountCredentialsFileName: string;
    firebaseServiceAccountCredentials: string;
    method: 'MOBILE_APP';
}

// Delivery Methods Configs
export interface DeliveryMethodsConfigs {
    SLACK?: SlackConfig;
    MOBILE_APP?: MobileAppConfig;
}

// Notification Settings
export interface NotificationSettings {
    deliveryMethodsConfigs: DeliveryMethodsConfigs;
}

// SMPP Dropdown Options
export const SMPP_PROTOCOL_VERSIONS = [
    { value: 3.3, label: '3.3' },
    { value: 3.4, label: '3.4' },
];

export const SMPP_BIND_TYPES = [
    { value: 'TX', label: 'TX - Binds the ESME as a transmitter only' },
    { value: 'RX', label: 'RX - Binds the ESME as a receiver only' },
    { value: 'TRX', label: 'TRX - Binds the ESME as a transceiver' },
];

export const SMPP_TON_OPTIONS = [
    { value: 0, label: '0 - Unknown' },
    { value: 1, label: '1 - International' },
    { value: 2, label: '2 - National' },
    { value: 3, label: '3 - Network Specific' },
    { value: 4, label: '4 - Subscriber Number' },
    { value: 5, label: '5 - Alphanumeric' },
    { value: 6, label: '6 - Abbreviated' },
];

export const SMPP_NPI_OPTIONS = [
    { value: 0, label: '0 - Unknown' },
    { value: 1, label: '1 - ISDN (E163/E164)' },
    { value: 3, label: '3 - Data (X.121)' },
    { value: 4, label: '4 - Telex (F.69)' },
    { value: 6, label: '6 - Land Mobile (E.212)' },
    { value: 8, label: '8 - National' },
    { value: 9, label: '9 - Private' },
    { value: 10, label: '10 - ERMES' },
    { value: 14, label: '14 - Internet (IP)' },
    { value: 18, label: '18 - WAP Client Id' },
];

export const SMPP_CODING_SCHEMES = [
    { value: 0, label: '0 - SMSC Default Alphabet' },
    { value: 1, label: '1 - IA5 (CCITT T.50)/ASCII (ANSI X3.4)' },
    { value: 2, label: '2 - Octet unspecified (8-bit binary)' },
    { value: 3, label: '3 - Latin 1 (ISO-8859-1)' },
    { value: 4, label: '4 - Octet unspecified (8-bit binary)' },
    { value: 5, label: '5 - JIS (X 0208-1990)' },
    { value: 6, label: '6 - Cyrillic (ISO-8859-5)' },
    { value: 7, label: '7 - Latin/Hebrew (ISO-8859-8)' },
    { value: 8, label: '8 - UCS2 (ISO/IEC-10646)' },
    { value: 9, label: '9 - Pictogram Encoding' },
    { value: 10, label: '10 - ISO-2022-JP (Music Codes)' },
    { value: 13, label: '13 - Extended Kanji JIS (X 0212-1990)' },
    { value: 14, label: '14 - KS C 5601' },
];

// Default values for new SMS configs
export const DEFAULT_AWS_SNS_CONFIG: AwsSnsConfig = {
    type: 'AWS_SNS',
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
};

export const DEFAULT_TWILIO_CONFIG: TwilioConfig = {
    type: 'TWILIO',
    numberFrom: '',
    accountSid: '',
    accountToken: '',
};

export const DEFAULT_SMPP_CONFIG: SmppConfig = {
    type: 'SMPP',
    protocolVersion: 3.4,
    host: '',
    port: 2775,
    systemId: '',
    password: '',
    systemType: '',
    bindType: 'TX',
    serviceType: '',
    sourceAddress: '',
    sourceTon: 5,
    sourceNpi: 0,
    destinationTon: 1,
    destinationNpi: 1,
    addressRange: '',
    codingScheme: 0,
};
