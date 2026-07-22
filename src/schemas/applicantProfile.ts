import { z } from 'zod';

const optionalText = z.string().trim().optional().default('');
const requiredText = z.string().trim();
const yearText = z.string().trim();

export const GenderSchema = z.enum(['Male', 'Female', 'Other']);
export const ReligionSchema = z.enum(['Islam', 'Hinduism', 'Buddhism', 'Christianity', 'Other']);
export const MaritalStatusSchema = z.enum(['Single', 'Married', 'Divorced', 'Widowed']);
export const QuotaTypeSchema = z.enum([
  'General',
  'Freedom Fighter',
  'Disabled',
  'Orphan',
  'Tribal',
  'Ansar-VDP',
  'Minority',
  'Other'
]);
export const ResultTypeSchema = z.enum(['GPA', 'CGPA', 'Division', 'Class', 'Percentage', 'Other']);
export const EmploymentTypeSchema = z.enum(['Government', 'Semi-Government', 'Autonomous', 'Private', 'Project', 'Contract', 'Other']);

export const IdentificationNumberSchema = z.object({
  available: z.boolean().default(false),
  number: optionalText
});

export const AddressSchema = z.object({
  careOf: optionalText,
  villageRoadHouse: optionalText,
  district: optionalText,
  upazila: optionalText,
  postOffice: optionalText,
  postCode: optionalText
});

export const SecondaryEducationSchema = z.object({
  examination: optionalText,
  board: optionalText,
  rollNumber: optionalText,
  resultType: ResultTypeSchema.default('GPA'),
  resultValue: optionalText,
  groupSubject: optionalText,
  passingYear: yearText.optional().default('')
});

export const HigherEducationSchema = z.object({
  examination: optionalText,
  university: optionalText,
  degree: optionalText,
  subject: optionalText,
  resultType: ResultTypeSchema.default('CGPA'),
  resultValue: optionalText,
  passingYear: yearText.optional().default(''),
  courseDuration: optionalText
});

export const ResearchDegreeSchema = z.object({
  applicable: z.boolean().default(false),
  examination: optionalText,
  university: optionalText,
  degree: optionalText,
  subject: optionalText,
  result: optionalText,
  passingYear: yearText.optional().default('')
});

export const PhdSchema = ResearchDegreeSchema.extend({
  thesisTitle: optionalText
});

export const TrainingRecordSchema = z.object({
  trainingName: optionalText,
  institution: optionalText,
  duration: optionalText,
  completionYear: yearText.optional().default('')
});

export const ExperienceRecordSchema = z.object({
  organization: optionalText,
  designation: optionalText,
  employmentType: EmploymentTypeSchema.default('Government'),
  address: optionalText,
  startDate: optionalText,
  endDate: optionalText,
  currentlyWorking: z.boolean().default(false),
  jobDescription: optionalText
});

export const PublicationRecordSchema = z.object({
  title: optionalText,
  journal: optionalText,
  publisher: optionalText,
  publicationDate: optionalText
});

export const ApplicantProfileSchema = z.object({
  profileId: z.string().uuid(),
  profileName: requiredText.min(1, 'Profile name is required'),
  photo: optionalText,
  personal: z.object({
    fullNameEnglish: optionalText,
    fullNameBangla: optionalText,
    fatherNameEnglish: optionalText,
    fatherNameBangla: optionalText,
    motherNameEnglish: optionalText,
    motherNameBangla: optionalText,
    dateOfBirth: optionalText,
    gender: GenderSchema.default('Male'),
    religion: ReligionSchema.default('Islam'),
    nationality: z.string().trim().default('Bangladeshi'),
    maritalStatus: MaritalStatusSchema.default('Single')
  }),
  identification: z.object({
    nationalId: IdentificationNumberSchema,
    birthRegistration: IdentificationNumberSchema,
    passport: IdentificationNumberSchema
  }),
  contact: z.object({
    mobileNumber: optionalText,
    email: optionalText,
    alternativeMobile: optionalText
  }),
  address: z.object({
    presentAddress: AddressSchema,
    permanentAddress: AddressSchema,
    sameAsPresentAddress: z.boolean().default(false)
  }),
  quota: z.object({
    quotaType: QuotaTypeSchema.default('General')
  }),
  education: z.object({
    ssc: SecondaryEducationSchema,
    hsc: SecondaryEducationSchema,
    bachelor: HigherEducationSchema,
    masters: HigherEducationSchema.optional(),
    mphil: ResearchDegreeSchema.optional(),
    phd: PhdSchema.optional()
  }),
  training: z.array(TrainingRecordSchema).default([]),
  experiences: z.array(ExperienceRecordSchema).default([]),
  publications: z.array(PublicationRecordSchema).default([]),
  additionalInformation: z.record(z.string(), z.union([z.boolean(), z.string(), z.number(), z.null()])).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type ApplicantProfile = z.infer<typeof ApplicantProfileSchema>;
export type TrainingRecord = z.infer<typeof TrainingRecordSchema>;
export type ExperienceRecord = z.infer<typeof ExperienceRecordSchema>;
export type PublicationRecord = z.infer<typeof PublicationRecordSchema>;
export type QuotaType = z.infer<typeof QuotaTypeSchema>;
