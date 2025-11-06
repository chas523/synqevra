export interface PatientName {
  family: string;
  given: string[];
}
export type PatientShort = {
  id: string;
  name: PatientName[];
  photo?: {
    url: string;
    title: string;
  }[];
  telecom?: {
    system: "phone";
    use: "mobile";
    value: string;
  }[];
};
