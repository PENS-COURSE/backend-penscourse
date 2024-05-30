import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Job } from 'bull';
import * as moment from 'moment';
import { PrismaService } from '../prisma/prisma.service';
import { StringHelper } from '../utils/slug.utils';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';

@Processor('certificates')
export class CertificatesConsumer {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CERTIFICATE_GENERATOR_SERVICE')
    private readonly certificateService: ClientProxy,
  ) {}

  @Process('generator-certificate')
  async generatorCertificate(job: Job<GenerateCertificateDto>) {
    const payload = job.data;

    console.log('Payload :', payload);

    const course = await this.prisma.course.findFirst({
      where: {
        slug: payload.course_slug,
      },
      include: {
        user: true,
        department: true,
        enrollments: {
          include: {
            user: true,
          },
        },
        curriculums: {
          include: {
            live_classes: {
              include: {
                ParticipantLiveClass: true,
              },
            },
            quizzes: {
              include: {
                sessions: true,
              },
            },
          },
        },
      },
    });

    const minimumScoreDailyQuiz = payload.minimum_daily_quiz_score ?? null;
    const minimumScoreFinalQuiz = payload.minimum_final_quiz_score ?? null;
    const minimumDurationLiveClass = payload.minimum_duration_liveclass ?? null;

    await Promise.all(
      payload.list_participant_ids.map(async (participant_id) => {
        const user = course.enrollments.find(
          (enrollment) => enrollment.user_id === participant_id,
        ).user;

        const listScoreQuizDaily: number[] = [];
        const listScoreQuizFinal: number[] = [];
        let totalDurationLiveClass = 0;

        // Daily Quiz
        await Promise.all(
          payload.list_daily_quiz_ids.map(async (quiz_id) => {
            const quizScore = course.curriculums
              .find((curriculum) =>
                curriculum.quizzes.find((quiz) => quiz.id === quiz_id),
              )
              .quizzes.find((quiz) => quiz.id === quiz_id)
              .sessions.find(
                (session) => session.user_id === participant_id,
              )?.score;

            if (quizScore) listScoreQuizDaily.push(quizScore);
            else listScoreQuizDaily.push(0);
          }),
        );

        // Final Quiz
        await Promise.all(
          payload.list_final_quiz_ids.map(async (quiz_id) => {
            const quizScore = course.curriculums
              .find((curriculum) =>
                curriculum.quizzes.find((quiz) => quiz.id === quiz_id),
              )
              .quizzes.find((quiz) => quiz.id === quiz_id)
              .sessions.find(
                (session) => session.user_id === participant_id,
              )?.score;

            if (quizScore) listScoreQuizFinal.push(quizScore);
            else listScoreQuizFinal.push(0);
          }),
        );

        // Live Class Duration
        await Promise.all(
          course.curriculums.map(async (curriculum) => {
            const liveClassDuration = curriculum.live_classes
              .map((liveClass) =>
                liveClass.ParticipantLiveClass.filter(
                  (participant) => participant.user_id === participant_id,
                ),
              )
              .flat()
              .reduce((acc, curr) => acc + curr.duration, 0);

            totalDurationLiveClass += liveClassDuration;
          }),
        );

        // Average Score Daily Quiz
        const averageScoreDailyQuiz =
          listScoreQuizDaily.reduce((acc, curr) => acc + curr, 0) /
          listScoreQuizDaily.length;

        // Average Score Final Quiz
        const averageScoreFinalQuiz =
          listScoreQuizFinal.reduce((acc, curr) => acc + curr, 0) /
          listScoreQuizFinal.length;

        // is User get competence certificate
        let isCompetenceCertificate = false;
        if (minimumScoreDailyQuiz && minimumScoreFinalQuiz) {
          isCompetenceCertificate =
            averageScoreDailyQuiz >= minimumScoreDailyQuiz &&
            averageScoreFinalQuiz >= minimumScoreFinalQuiz;
        } else if (minimumScoreDailyQuiz) {
          isCompetenceCertificate =
            averageScoreDailyQuiz >= minimumScoreDailyQuiz;
        } else if (minimumScoreFinalQuiz) {
          isCompetenceCertificate =
            averageScoreFinalQuiz >= minimumScoreFinalQuiz;
        } else {
          isCompetenceCertificate = false;
        }

        console.log('isCompetenceCertificate :', isCompetenceCertificate);

        // is User get participation certificate
        let isParticipationCertificate = false;
        if (minimumDurationLiveClass) {
          isParticipationCertificate =
            totalDurationLiveClass >= minimumDurationLiveClass;
        } else {
          isParticipationCertificate = false;
        }

        console.log('isParticipationCertificate :', isParticipationCertificate);

        // Generate Certificate ID
        const year = new Date().getFullYear();
        const getLatestCertificateID = await this.prisma.certificate.findFirst({
          orderBy: {
            created_at: 'desc',
          },
        });

        const patternCertificateId = `PENS-OC-TYPE-${StringHelper.getInitials(course.department.name).toUpperCase()}-${year}-${String(getLatestCertificateID ? getLatestCertificateID.id + 1 : 1).padStart(5, '0')}`;
        const durationToHour = Math.floor(totalDurationLiveClass / 60);

        // Generate Certificate
        if (isCompetenceCertificate) {
          console.log('Competence Generated ...');

          const certificate = await this.prisma.certificate.create({
            data: {
              no_cert: patternCertificateId.replace('TYPE', 'C'),
              user_id: user.id,
              type: 'competence',
              course_id: course.id,
              total_duration: durationToHour,
            },
          });

          if (averageScoreDailyQuiz) {
            await this.prisma.certificateScore.create({
              data: {
                certificate_id: certificate.id,
                quiz_type: 'daily',
                score: averageScoreDailyQuiz,
              },
            });
          }

          if (averageScoreFinalQuiz) {
            await this.prisma.certificateScore.create({
              data: {
                certificate_id: certificate.id,
                quiz_type: 'final',
                score: averageScoreFinalQuiz,
              },
            });
          }

          this.certificateService.emit('certificate.generate', {
            name: user.name,
            certificate_id: patternCertificateId.replace('TYPE', 'C'),
            course_name: course.name,
            instructor: course?.user?.name ?? course.department.name,
            date: moment().format('DD MMMM YYYY'),
            duration: durationToHour,
            certificate_type: 'Certificate of Competency',
          });
        }

        if (isParticipationCertificate) {
          console.log('Participation Generated ...');

          await this.prisma.certificate.create({
            data: {
              no_cert: patternCertificateId.replace('TYPE', 'P'),
              user_id: user.id,
              type: 'competence',
              course_id: course.id,
              total_duration: durationToHour,
            },
          });

          this.certificateService.emit('certificate.generate', {
            name: user.name,
            certificate_id: patternCertificateId.replace('TYPE', 'P'),
            course_name: course.name,
            instructor: course?.user?.name ?? course.department.name,
            date: moment().format('DD MMMM YYYY'),
            duration: durationToHour,
            certificate_type: 'Certificate of Attendance',
          });
        }

        job.progress(100);
      }),
    );
  }

  @OnQueueFailed()
  async handleError(job: Job, error: Error) {
    console.log(error);
  }
}
