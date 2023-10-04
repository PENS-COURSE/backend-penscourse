import { fakerID_ID as faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { HashHelpers } from '../src/utils/hash.utils';
import { StringHelper } from '../src/utils/slug.utils';
const prisma = new PrismaClient();

const main = async () => {
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
          email: faker.internet.email({ provider: provider }),
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

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
