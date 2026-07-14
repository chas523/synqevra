import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

/**
 * Tabela patients_medplum: mapowanie patientId ↔ medplumId.
 * Composite PK: (patientId, medplumId).
 * medplumId to FK do tabeli medplum (gdzie są client_id / client_secret).
 */
@Entity('patients_medplum')
export class PatientMedplum {
  @PrimaryColumn()
  patientId: number;

  /**
   * ID rekordu z tabeli `medplum` (zawiera client_id / client_secret)
   */
  @PrimaryColumn()
  medplumId: number;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;
}
