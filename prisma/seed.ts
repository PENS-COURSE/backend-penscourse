import { fakerID_ID as faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';
import { ParseArgsConfig, parseArgs } from 'node:util';
import { HashHelpers } from '../src/utils/hash.utils';
import { StringHelper } from '../src/utils/slug.utils';
const prisma = new PrismaClient();

const options: ParseArgsConfig['options'] = {
  model: { type: 'string' },
};

const main = async () => {
  const {
    values: { model },
  } = parseArgs({ options });

  switch (model) {
    case 'all':
      await admin()
        .then(async () => users())
        .then(async () => departments())
        .then(async () => curriculums());
      break;
    case 'admin':
      await admin();
      break;
    case 'users':
      await users();
      break;
    case 'departments':
      await departments();
      break;
    case 'curriculums':
      await curriculums();
      break;
    default:
      console.error('Model not found');
      process.exit(1);
  }
};

const admin = async () => {
  const admin = await prisma.user.findFirst({
    where: {
      email: 'admin@pens.ac.id',
    },
  });

  if (!admin) {
    await prisma.user.create({
      data: {
        name: 'Admin Online Classroom PENS',
        email: 'admin@pens.ac.id',
        password: await HashHelpers.hashPassword('password'),
        role: 'admin',
      },
    });

    console.log(`Successfully created admin`);
  }
};

const departments = async () => {
  const departments = await prisma.department.findMany();
  const users = await prisma.user.findMany({
    where: {
      role: 'dosen',
    },
  });

  const dummyDepartments: Prisma.DepartmentCreateInput[] = [
    {
      name: 'Teknik Informatika',
      slug: StringHelper.slug('Teknik Informatika'),
      benefits_note: faker.lorem.paragraph(),
      opportunities_note: faker.lorem.paragraph(),
      participant_note: faker.lorem.paragraph(),
      description: faker.lorem.paragraph(),
      is_active: true,
      icon: faker.image.urlPlaceholder(),
      courses: {
        createMany: {
          data: [
            {
              name: 'Boost Your Design Work using Top Figma Plugins',
              slug: StringHelper.slug(
                'Boost Your Design Work using Top Figma Plugins',
              ),
              is_active: true,
              is_free: true,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: false,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: null,
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
            {
              name: 'Full-Stack Android Developer',
              slug: StringHelper.slug('Full-Stack Android Developer'),
              is_active: true,
              is_free: false,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: true,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: Math.round(
                faker.number.float({ min: 50000, max: 100000 }),
              ),
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
          ],
        },
      },
    },
    {
      name: 'Teknik Telekomunikasi',
      slug: StringHelper.slug('Teknik Telekomunikasi'),
      benefits_note: faker.lorem.paragraph(),
      opportunities_note: faker.lorem.paragraph(),
      participant_note: faker.lorem.paragraph(),
      description: faker.lorem.paragraph(),
      is_active: true,
      icon: faker.image.urlPlaceholder(),
      courses: {
        createMany: {
          data: [
            {
              name: 'Dasar-dasar Sistem Telekomunikasi',
              slug: StringHelper.slug('Dasar-dasar Sistem Telekomunikasi'),
              is_active: true,
              is_free: true,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: false,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: null,
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
            {
              name: 'Pengenalan Teknologi 5G',
              slug: StringHelper.slug('Pengenalan Teknologi 5G'),
              is_active: true,
              is_free: false,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: true,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: Math.round(
                faker.number.float({ min: 50000, max: 100000 }),
              ),
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
          ],
        },
      },
    },
    {
      name: 'Teknik Elektro Industri',
      slug: StringHelper.slug('Teknik Elektro Industri'),
      benefits_note: faker.lorem.paragraph(),
      opportunities_note: faker.lorem.paragraph(),
      participant_note: faker.lorem.paragraph(),
      description: faker.lorem.paragraph(),
      is_active: true,
      icon: faker.image.urlPlaceholder(),
      courses: {
        createMany: {
          data: [
            {
              name: 'Pemodelan Sistem Kontrol dengan MATLAB',
              slug: StringHelper.slug('Pemodelan Sistem Kontrol dengan MATLAB'),
              is_active: true,
              is_free: true,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: false,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: null,
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
            {
              name: 'Desain Elektronika Terpadu dengan Altium Designer',
              slug: StringHelper.slug(
                'Desain Elektronika Terpadu dengan Altium Designer',
              ),
              is_active: true,
              is_free: false,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: true,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: Math.round(
                faker.number.float({ min: 50000, max: 100000 }),
              ),
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
          ],
        },
      },
    },
    {
      name: 'Teknik Elektronika',
      slug: StringHelper.slug('Teknik Elektronika'),
      benefits_note: faker.lorem.paragraph(),
      opportunities_note: faker.lorem.paragraph(),
      participant_note: faker.lorem.paragraph(),
      description: faker.lorem.paragraph(),
      is_active: true,
      icon: faker.image.urlPlaceholder(),
      courses: {
        createMany: {
          data: [
            {
              name: 'Mikrokontroler dan Sistem Embedded: Teori dan Praktek',
              slug: StringHelper.slug(
                'Mikrokontroler dan Sistem Embedded: Teori dan Praktek',
              ),
              is_active: true,
              is_free: true,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: false,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: null,
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
            {
              name: 'Desain Elektronika Digital dengan FPGA',
              slug: StringHelper.slug('Desain Elektronika Digital dengan FPGA'),
              is_active: true,
              is_free: false,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: true,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: Math.round(
                faker.number.float({ min: 50000, max: 100000 }),
              ),
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
          ],
        },
      },
    },
    {
      name: 'Teknik Mekatronika',
      slug: StringHelper.slug('Teknik Mekatronika'),
      benefits_note: faker.lorem.paragraph(),
      opportunities_note: faker.lorem.paragraph(),
      participant_note: faker.lorem.paragraph(),
      description: faker.lorem.paragraph(),
      is_active: true,
      icon: faker.image.urlPlaceholder(),
      courses: {
        createMany: {
          data: [
            {
              name: 'Pengantar Sistem Kontrol Mekatronika',
              slug: StringHelper.slug('Pengantar Sistem Kontrol Mekatronika'),
              is_active: true,
              is_free: true,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: false,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: null,
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
            {
              name: 'Mekanika dan Dinamika Robotika',
              slug: StringHelper.slug('Mekanika dan Dinamika Robotika'),
              is_active: true,
              is_free: false,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: true,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: Math.round(
                faker.number.float({ min: 50000, max: 100000 }),
              ),
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
          ],
        },
      },
    },
    {
      name: 'Teknik Komputer',
      slug: StringHelper.slug('Teknik Komputer'),
      benefits_note: faker.lorem.paragraph(),
      opportunities_note: faker.lorem.paragraph(),
      participant_note: faker.lorem.paragraph(),
      description: faker.lorem.paragraph(),
      is_active: true,
      icon: faker.image.urlPlaceholder(),
      courses: {
        createMany: {
          data: [
            {
              name: 'Arsitektur Komputer dan Organisasi',
              slug: StringHelper.slug('Arsitektur Komputer dan Organisasi'),
              is_active: true,
              is_free: true,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: false,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: null,
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
            {
              name: 'Pemrograman Lanjut dengan C++',
              slug: StringHelper.slug('Pemrograman Lanjut dengan C++'),
              is_active: true,
              is_free: false,
              grade_level: faker.helpers.shuffle([
                'beginner',
                'intermediate',
                'advanced',
              ])[0] as any,
              description: faker.lorem.paragraph(),
              is_certified: true,
              max_students: faker.number.int({ min: 10, max: 100 }),
              price: Math.round(
                faker.number.float({ min: 50000, max: 100000 }),
              ),
              start_date: new Date(),
              end_date: new Date(),
              user_id: faker.helpers.shuffle(users)[0].id,
            },
          ],
        },
      },
    },
  ];

  if (departments.length == 0) {
    dummyDepartments.forEach(async (department) => {
      await prisma.department.create({
        data: {
          ...department,
        },
      });
    });

    console.log(`Successfully created departments`);
  }
};

const users = async () => {
  const users = await prisma.user.findMany();

  if (users.length == 0) {
    for (let i = 0; i <= 50; i++) {
      const role = faker.helpers.shuffle(['admin', 'dosen', 'user'])[0];
      const provider =
        role == 'admin' || role == 'dosen'
          ? 'pens.ac.id'
          : 'student.pens.ac.id';
      await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          password: await HashHelpers.hashPassword('password'),
          email: faker.internet
            .email({ provider: provider })
            .toLocaleLowerCase(),
          role: role as any,
          email_verified_at: i % 2 == 0 ? new Date() : null,
          lecture:
            role == 'dosen'
              ? {
                  create: {
                    nip: faker.number
                      .int({ min: 1000000000, max: 9999999999 })
                      .toString(),
                  },
                }
              : {},
        },
      });
    }
    console.log(`Successfully created users`);
  }
};

const curriculums = async () => {
  const dummyVideoURL: string[] = [
    'https://www.youtube.com/watch?v=AII0Dv1ypNU&pp=ygUNa3VsZGkgcHJvamVjdA%3D%3D',
    'https://www.youtube.com/watch?v=mEnHFfpeLUQ&pp=ygUNa3VsZGkgcHJvamVjdA%3D%3D',
    'https://www.youtube.com/watch?v=9Mv1gSrXrlg&pp=ygUNa3VsZGkgcHJvamVjdA%3D%3D',
    'https://www.youtube.com/watch?v=F5q0oz5pryY&t=616s&pp=ygUNa3VsZGkgcHJvamVjdA%3D%3D',
    'https://www.youtube.com/watch?v=epRWFH47xCI&pp=ygUNa3VsZGkgcHJvamVjdA%3D%3D',
  ];

  const dummyFileURL: string[] = [
    'https://repository.uir.ac.id/4644/5/bab2.pdf',
    'https://repository.uir.ac.id/4561/6/bab2.pdf',
    'http://repository.unpas.ac.id/11242/5/BAB%20II.pdf',
    'https://eprints.walisongo.ac.id/id/eprint/4059/3/103911025_bab2.pdf',
    'http://repository.iainpare.ac.id/1639/1/Belajar%20Dan%20Pembelajaran.pdf',
  ];

  const dummyCurriculums = [
    {
      title: 'Introdution',
      slug: StringHelper.slug('Introdution'),
      week: 1,
      video_contents: {
        createMany: {
          data: [1, 2, 3].map((i) => ({
            title: faker.music.songName(),
            url: faker.helpers.shuffle(dummyVideoURL)[0],
            duration: `${i} Jam`,
          })),
        },
      },
      file_contents: {
        createMany: {
          data: [1, 2, 3].map(() => ({
            title: faker.music.songName(),
            url: faker.helpers.shuffle(dummyFileURL)[0],
            file_type: 'pdf',
          })),
        },
      },
      live_classes: {
        createMany: {
          data: [1, 2, 3].map(() => ({
            title: faker.music.songName(),
            url: `https://meet.jit.si/${StringHelper.slug(
              faker.music.songName(),
            )}`,
            start_date: faker.date.future(),
          })),
        },
      },
    },
    {
      title: 'Responsive UI',
      slug: StringHelper.slug('Responsive UI'),
      week: 2,
      video_contents: {
        createMany: {
          data: [1, 2, 3].map((i) => ({
            title: faker.music.songName(),
            url: faker.helpers.shuffle(dummyVideoURL)[0],
            duration: `${i} Jam`,
          })),
        },
      },
      file_contents: {
        createMany: {
          data: [1, 2, 3].map(() => ({
            title: faker.music.songName(),
            url: faker.helpers.shuffle(dummyFileURL)[0],
            file_type: 'pdf',
          })),
        },
      },
      live_classes: {
        createMany: {
          data: [1, 2, 3].map(() => ({
            title: faker.music.songName(),
            url: `https://meet.jit.si/${StringHelper.slug(
              faker.music.songName(),
            )}`,
            start_date: faker.date.future(),
          })),
        },
      },
    },
    {
      title: 'Adaptive UI',
      slug: StringHelper.slug('Adaptive UI'),
      week: 3,
      video_contents: {
        createMany: {
          data: [1, 2, 3].map((i) => ({
            title: faker.music.songName(),
            url: faker.helpers.shuffle(dummyVideoURL)[0],
            duration: `${i} Jam`,
          })),
        },
      },
      file_contents: {
        createMany: {
          data: [1, 2, 3].map(() => ({
            title: faker.music.songName(),
            url: faker.helpers.shuffle(dummyFileURL)[0],
            file_type: 'pdf',
          })),
        },
      },
      live_classes: {
        createMany: {
          data: [1, 2, 3].map(() => ({
            title: faker.music.songName(),
            url: `https://meet.jit.si/${StringHelper.slug(
              faker.music.songName(),
            )}`,
            start_date: faker.date.future(),
          })),
        },
      },
    },
    {
      title: 'Animation',
      slug: StringHelper.slug('Animation'),
      week: 4,
      video_contents: {
        createMany: {
          data: [1, 2, 3].map((i) => ({
            title: faker.music.songName(),
            url: faker.helpers.shuffle(dummyVideoURL)[0],
            duration: `${i} Jam`,
          })),
        },
      },
      file_contents: {
        createMany: {
          data: [1, 2, 3].map(() => ({
            title: faker.music.songName(),
            url: faker.helpers.shuffle(dummyFileURL)[0],
            file_type: 'pdf',
          })),
        },
      },
      live_classes: {
        createMany: {
          data: [1, 2, 3].map(() => ({
            title: faker.music.songName(),
            url: `https://meet.jit.si/${StringHelper.slug(
              faker.music.songName(),
            )}`,
            start_date: faker.date.future(),
          })),
        },
      },
    },
    {
      title: 'Sliver Widget',
      slug: StringHelper.slug('Sliver Widget'),
      week: 5,
      video_contents: {
        createMany: {
          data: [1, 2, 3].map((i) => ({
            title: faker.music.songName(),
            url: faker.helpers.shuffle(dummyVideoURL)[0],
            duration: `${i} Jam`,
          })),
        },
      },
      file_contents: {
        createMany: {
          data: [1, 2, 3].map(() => ({
            title: faker.music.songName(),
            url: faker.helpers.shuffle(dummyFileURL)[0],
            file_type: 'pdf',
          })),
        },
      },
      live_classes: {
        createMany: {
          data: [1, 2, 3].map(() => ({
            title: faker.music.songName(),
            url: `https://meet.jit.si/${StringHelper.slug(
              faker.music.songName(),
            )}`,
            start_date: faker.date.future(),
          })),
        },
      },
    },
  ];

  const courses = await prisma.course.findMany();
  if (courses.length == 0) {
    console.error('Courses is empty');
    process.exit(1);
  }

  Promise.all(
    courses.map(async (course) => {
      await Promise.all(
        dummyCurriculums.map(async (curriculum) => {
          await prisma.curriculum.create({
            data: {
              ...curriculum,
              course_id: course.id,
            },
          });
        }),
      );
    }),
  );

  console.log(`Successfully created curriculums`);
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
