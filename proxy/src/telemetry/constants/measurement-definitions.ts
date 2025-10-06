import { QuantityUnit } from '@medplum/core';
import { Coding } from '@medplum/fhirtypes';

export const CODING_MAP: Record<string, Coding> = {
  temperature: {
    system: 'http://loinc.org',
    code: '8310-5',
    display: 'Body temperature',
  },
  heart_rate: {
    system: 'http://loinc.org',
    code: '8867-4',
    display: 'Heart rate',
  },
  respiratory_rate: {
    system: 'http://loinc.org',
    code: '9279-1',
    display: 'Respiratory rate',
  },
  blood_pressure_systolic: {
    system: 'http://loinc.org',
    code: '8480-6',
    display: 'Systolic blood pressure',
  },
  blood_pressure_diastolic: {
    system: 'http://loinc.org',
    code: '8462-4',
    display: 'Diastolic blood pressure',
  },
};

export const UNIT_MAP: Record<string, QuantityUnit> = {
  temperature: { unit: '°C', system: 'http://unitsofmeasure.org', code: 'Cel' },
  heart_rate: {
    unit: 'beats/minute',
    system: 'http://unitsofmeasure.org',
    code: '/min',
  },
  respiratory_rate: {
    unit: 'breaths/minute',
    system: 'http://unitsofmeasure.org',
    code: '/min',
  },
  blood_pressure_systolic: {
    unit: 'mmHg',
    system: 'http://unitsofmeasure.org',
    code: 'mm[Hg]',
  },
  blood_pressure_diastolic: {
    unit: 'mmHg',
    system: 'http://unitsofmeasure.org',
    code: 'mm[Hg]',
  },
};
