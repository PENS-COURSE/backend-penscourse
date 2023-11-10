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
        .then(async () => curriculums())
        .then(async () => subjects());
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
    case 'subjects':
      await subjects();
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
              user_id: 1,
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
              user_id: 1,
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
              user_id: 1,
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
              user_id: 1,
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
              user_id: 1,
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
              user_id: 1,
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
              user_id: 1,
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
              user_id: 1,
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
              user_id: 1,
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
              user_id: 1,
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
              user_id: 1,
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
              user_id: 1,
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
  const curriculums = await prisma.curriculum.findMany();
  if (curriculums.length == 0) {
    const courses = await prisma.course.findMany();

    for (let i = 1; i < 50; i++) {
      const name = faker.word.words();
      await prisma.curriculum.create({
        data: {
          title: name,
          slug: StringHelper.slug(name),
          week: i,
          course_id: faker.helpers.shuffle(courses)[0].id,
        },
      });
    }

    console.log(`Successfully created curriculums`);
  }
};

const subjects = async () => {
  const curriculums = await prisma.curriculum.findMany();
  if (curriculums.length != 0) {
    const liveClasses = [];
    const videoContents = [];
    const fileContents = [];

    for (let i = 1; i < 10; i++) {
      liveClasses.push({
        title: faker.word.words(),
        description: faker.lorem.paragraph(),
        url: faker.internet.url(),
      });

      videoContents.push({
        title: faker.word.words(),
        description: faker.lorem.paragraph(),
        url: faker.internet.url(),
      });

      fileContents.push({
        title: faker.word.words(),
        url: faker.internet.url(),
        file_type: faker.helpers.shuffle(['pdf', 'docx', 'pptx'])[0] as any,
      });
    }

    curriculums.forEach(async (curriculum) => {
      await prisma.curriculum.update({
        where: {
          id: curriculum.id,
        },
        data: {
          live_classes: {
            createMany: {
              data: liveClasses,
            },
          },
          video_contents: {
            createMany: {
              data: videoContents,
            },
          },
          file_contents: {
            createMany: {
              data: fileContents,
            },
          },
        },
      });
    });
  }
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
