import http from 'k6/http';
import { sleep, check } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Naikkan beban ke 100 users dalam 2 menit
    { duration: '3m', target: 100 }, // Tahan di 100 users selama 3 menit
    { duration: '2m', target: 0 }, // Turunkan beban ke 0 users dalam 2 menit
  ],
  thresholds: {
    http_req_duration: ['p(95)<250'], // 95% of requests must complete below 250ms
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
  },
};

const BASE_URL = 'http://localhost:3000';

function randomUser() {
  const name = randomString(10);
  const email = `${name}@example.com`;
  const password = randomString(10);
  return { name, email, password };
}

export default function () {
  const user = randomUser();

  // Register
  let registerRes = http.post(
    `${BASE_URL}/api/authentication/register`,
    JSON.stringify({
      name: user.name,
      email: user.email,
      password: user.password,
      password_confirmation: user.password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  check(registerRes, {
    'register success': (res) => res.status === 201,
  });

  sleep(1);

  // Login
  let loginRes = http.post(
    `${BASE_URL}/api/authentication/login`,
    JSON.stringify({
      email: user.email,
      password: user.password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  check(loginRes, {
    'login success': (res) => res.status === 200,
  });

  let accessToken = loginRes.json()['data']['token']['access_token'];

  sleep(1);

  const slugCourse = 'dasar-dasar-sistem-telekomunikasi-qz94kv';
  let enrollRes = http.post(
    `${BASE_URL}/api/courses/${slugCourse}/enroll`,
    null,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
    },
  );

  check(enrollRes, {
    'enroll success': (res) => res.status === 201,
  });

  sleep(1);

  const quizUUID = '70b449af-fa13-4e78-8344-8bbc3204040d';
  let startQuizRes = http.get(
    `${BASE_URL}/api/courses/${slugCourse}/quiz/${quizUUID}/enroll`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
    },
  );

  check(startQuizRes, {
    'start quiz success': (res) => res.status === 200,
  });

  let question = startQuizRes.json()['data']['questions'][0]['question'];
  let questionID = question['id'];
  let questionType = question['question_type'];
  let questionAnswer = questionType === 'multiple_choice' ? ['A', 'B'] : ['A'];
  let sessionQuiz = startQuizRes.json()['data']['detail']['session_id'];

  sleep(1);

  let answerRes = http.patch(
    `${BASE_URL}/api/courses/quiz/update-answer`,
    JSON.stringify({
      session_id: sessionQuiz,
      question_id: questionID,
      answer: questionAnswer,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
    },
  );

  check(answerRes, {
    'answer success': (res) => res.status === 200,
  });

  sleep(1);

  let submitRes = http.patch(
    `${BASE_URL}/api/courses/quiz/${sessionQuiz}/submit`,
    null,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
    },
  );

  check(submitRes, {
    'submit success': (res) => res.status === 200,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'report.html': htmlReport(data),
  };
}
