export default interface Certificate {
  type: 'Certificate of Competency' | 'Certificate of Attendance';
  course: string;
  course_instructor: string;
  date: string;
  no_certificate: string;
  participant_name: string;
  duration: string;
  request_token: string;
}
