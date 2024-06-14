import http from 'k6/http';
import { sleep, check, group } from 'k6';
import {
  randomString,
  randomItem,
} from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Naikkan beban ke 100 users dalam 2 menit
    { duration: '3m', target: 100 }, // Tahan di 100 users selama 3 menit
    { duration: '2m', target: 0 }, // Turunkan beban ke 0 users dalam 2 menit
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% dari response time harus dibawah 500ms
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000';
const slugCourse = 'full-stack-android-developer-91tmsr';
const quizUUID = 'aa9e1e8d-6811-42da-9337-568e08d8968b';

let accessToken;

function randomUser() {
  const name = randomString(10);
  const email = `${name}@example.com`;
  const password = randomString(10);
  return { name, email, password };
}

export function setup() {}

export default function () {
  group('Authentication Service', () => {
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
    console.log(
      `Response time for register: ${registerRes.timings.duration} ms`,
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
    console.log(`Response time for login: ${loginRes.timings.duration} ms`);

    check(loginRes, {
      'login success': (res) => res.status === 200,
    });

    accessToken = loginRes.json()['data']['token']['access_token'];

    sleep(1);
  });

  group('Course Service', () => {
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
    console.log(`Response time for enroll: ${enrollRes.timings.duration} ms`);

    check(enrollRes, {
      'enroll success': (res) => res.status === 201,
    });

    sleep(1);
  });

  group('Quiz Service', () => {
    let startQuizRes = http.get(
      `${BASE_URL}/api/courses/${slugCourse}/quiz/${quizUUID}/enroll`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
      },
    );
    console.log(
      `Response time for start quiz: ${startQuizRes.timings.duration} ms`,
    );

    check(startQuizRes, {
      'start quiz success': (res) => res.status === 200,
    });

    let questions = startQuizRes.json()['data']['questions'];
    let sessionQuiz = startQuizRes.json()['data']['detail']['session_id'];

    let answerRes = http.patch(
      `${BASE_URL}/api/courses/quiz/update-answers`,
      JSON.stringify({
        session_id: sessionQuiz,
        answers: questions.map((question) => ({
          question_id: question.question.id,
          answer: [randomItem(['A', 'B', 'C', 'D', 'E'])],
        })),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
      },
    );
    console.log(
      `Response time for answer question: ${answerRes.timings.duration} ms`,
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

    console.log(
      `Response time for submit quiz: ${submitRes.timings.duration} ms`,
    );

    check(submitRes, {
      'submit success': (res) => res.status === 200,
    });

    sleep(1);
  });
}
