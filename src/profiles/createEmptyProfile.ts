import type { ApplicantProfile } from '@/schemas/applicantProfile';

export function createEmptyProfile(profileName = 'New Applicant'): ApplicantProfile {
  const now = new Date().toISOString();

  return {
    profileId: crypto.randomUUID(),
    profileName,
    photo: '',
    personal: {
      fullNameEnglish: '',
      fullNameBangla: '',
      fatherNameEnglish: '',
      fatherNameBangla: '',
      motherNameEnglish: '',
      motherNameBangla: '',
      dateOfBirth: '',
      gender: 'Male',
      religion: 'Islam',
      nationality: 'Bangladeshi',
      maritalStatus: 'Single'
    },
    identification: {
      nationalId: { available: false, number: '' },
      birthRegistration: { available: false, number: '' },
      passport: { available: false, number: '' }
    },
    contact: {
      mobileNumber: '',
      email: '',
      alternativeMobile: ''
    },
    address: {
      presentAddress: {
        careOf: '',
        villageRoadHouse: '',
        district: '',
        upazila: '',
        postOffice: '',
        postCode: ''
      },
      permanentAddress: {
        careOf: '',
        villageRoadHouse: '',
        district: '',
        upazila: '',
        postOffice: '',
        postCode: ''
      },
      sameAsPresentAddress: false
    },
    quota: {
      quotaType: 'General'
    },
    education: {
      ssc: {
        examination: 'SSC',
        board: '',
        rollNumber: '',
        resultType: 'GPA',
        resultValue: '',
        groupSubject: '',
        passingYear: ''
      },
      hsc: {
        examination: 'HSC',
        board: '',
        rollNumber: '',
        resultType: 'GPA',
        resultValue: '',
        groupSubject: '',
        passingYear: ''
      },
      bachelor: {
        examination: 'Bachelor',
        university: '',
        degree: '',
        subject: '',
        resultType: 'CGPA',
        resultValue: '',
        passingYear: '',
        courseDuration: ''
      },
      masters: {
        examination: 'Masters',
        university: '',
        degree: '',
        subject: '',
        resultType: 'CGPA',
        resultValue: '',
        passingYear: '',
        courseDuration: ''
      },
      mphil: {
        applicable: false,
        examination: 'MPhil',
        university: '',
        degree: '',
        subject: '',
        result: '',
        passingYear: ''
      },
      phd: {
        applicable: false,
        examination: 'PhD',
        university: '',
        degree: '',
        subject: '',
        result: '',
        passingYear: '',
        thesisTitle: ''
      }
    },
    training: [],
    experiences: [],
    publications: [],
    additionalInformation: {},
    createdAt: now,
    updatedAt: now
  };
}
