import { fakerID_ID as faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { HashHelpers } from '../src/utils/hash.utils';
import { StringHelper } from '../src/utils/slug.utils';
const prisma = new PrismaClient();

const main = async () => {
  await Promise.all([admin(), departments(), users(), courses()]);
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

  if (departments.length == 0) {
    for (let i = 0; i <= 50; i++) {
      const name = faker.company.name();
      await prisma.department.create({
        data: {
          name: name,
          slug: StringHelper.slug(name),
          benefits_note: faker.lorem.paragraph(),
          opportunities_note: faker.lorem.paragraph(),
          participant_note: faker.lorem.paragraph(),
          description: faker.lorem.paragraph(),
          is_active: true,
          icon: faker.image.urlPlaceholder(),
        },
      });
    }

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

const courses = async () => {
  const courses = await prisma.course.findMany();
  const departments = await prisma.department.findMany();
  const users = await prisma.user.findMany({
    where: {
      role: 'dosen',
    },
  });

  if (courses.length == 0) {
    for (let i = 1; i < 50; i++) {
      const name = faker.commerce.productName();
      const slug = StringHelper.slug(name);
      const isFree = faker.datatype.boolean();
      const startDate = faker.date.future();

      await prisma.course.create({
        data: {
          name: name,
          is_free: isFree,
          slug,
          is_active: faker.datatype.boolean(),
          grade_level: faker.helpers.shuffle([
            'beginner',
            'intermediate',
            'advanced',
          ])[0] as any,
          department_id: faker.helpers.shuffle(departments)[0].id,
          description: faker.lorem.paragraph(),
          is_certified: faker.datatype.boolean(),
          price: isFree
            ? null
            : faker.number.int({ min: 100000, max: 1000000 }),
          start_date: startDate,
          end_date: faker.date.future(undefined, startDate),
          max_students: faker.number.int({ min: 10, max: 100 }),
          user_id: faker.helpers.shuffle(users)[0].id,
        },
      });
    }
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
