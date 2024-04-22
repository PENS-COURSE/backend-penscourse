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
        .then(async () => await users())
        .then(async () => await departments())
        .then(async () => await curriculums());
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
    case 'quiz':
      await quiz();
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
  for (let i = 0; i <= 50; i++) {
    const role = faker.helpers.shuffle(['admin', 'dosen', 'user'])[0];
    const provider =
      role == 'admin' || role == 'dosen' ? 'pens.ac.id' : 'student.pens.ac.id';
    await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        password: await HashHelpers.hashPassword('password'),
        email: faker.internet.email({ provider: provider }).toLowerCase(),
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
};

const curriculums = async () => {
  const courses = await prisma.course.findMany();

  await Promise.all(
    courses.map(async (course) => {
      await prisma.curriculum.create({
        data: {
          title: faker.lorem.words(),
          slug: StringHelper.slug(faker.lorem.words()),
          week: faker.number.int({ min: 1, max: 12 }),
          course_id: course.id,
          file_contents: {
            createMany: {
              data: [
                {
                  title: 'Laporan Keuangan Kuartal II 2023',
                  description:
                    'Laporan keuangan perusahaan untuk kuartal II tahun 2023',
                  url: faker.internet.domainName(),
                  file_type: 'pdf',
                },
                {
                  title: 'Panduan Pemasaran Produk Baru',
                  description:
                    'Dokumen panduan strategi pemasaran untuk produk baru perusahaan',
                  url: faker.internet.domainName(),
                  file_type: 'docx',
                },
                {
                  title: 'Foto Kantor Pusat',
                  description: 'Kumpulan foto gedung kantor pusat perusahaan',
                  url: faker.internet.domainName(),
                  file_type: 'zip',
                },
                {
                  title: 'Data Penelitian Pasar 2022',
                  description:
                    'File spreadsheet yang berisi data penelitian pasar tahun 2022',
                  url: faker.internet.domainName(),
                  file_type: 'xlsx',
                },
                {
                  title: 'Video Promosi Produk',
                  description: 'Video promosi untuk produk unggulan perusahaan',
                  url: faker.internet.domainName(),
                  file_type: 'mp4',
                },
                {
                  title: 'Proposal Proyek Baru',
                  description:
                    'Dokumen proposal untuk proyek baru yang akan dijalankan perusahaan',
                  url: faker.internet.domainName(),
                  file_type: 'docx',
                },
                {
                  title: 'Gambar Produk Terbaru',
                  description:
                    'Kumpulan gambar produk terbaru yang diluncurkan perusahaan',
                  url: faker.internet.domainName(),
                  file_type: 'zip',
                },
                {
                  title: 'Laporan Survei Kepuasan Pelanggan',
                  description:
                    'Laporan hasil survei kepuasan pelanggan tahun 2023',
                  url: faker.internet.domainName(),
                  file_type: 'pdf',
                },
                {
                  title: 'Template Presentasi Perusahaan',
                  description:
                    'File template presentasi yang digunakan untuk presentasi perusahaan',
                  url: faker.internet.domainName(),
                  file_type: 'pptx',
                },
                {
                  title: 'Data Penjualan Online 2021-2023',
                  description:
                    'File spreadsheet yang berisi data penjualan online dari tahun 2021 hingga 2023',
                  url: faker.internet.domainName(),
                  file_type: 'xlsx',
                },
                {
                  title: 'Panduan Kebijakan Sumber Daya Manusia',
                  description:
                    'Dokumen panduan kebijakan sumber daya manusia perusahaan',
                  url: faker.internet.domainName(),
                  file_type: 'docx',
                },
                {
                  title: 'Video Pelatihan Karyawan',
                  description: 'Video pelatihan untuk karyawan baru perusahaan',
                  url: faker.internet.domainName(),
                  file_type: 'mp4',
                },
                {
                  title: 'Buku Panduan Teknologi Baru',
                  description:
                    'Buku panduan tentang teknologi baru yang akan diimplementasikan perusahaan',
                  url: faker.internet.domainName(),
                  file_type: 'epub',
                },
                {
                  title: 'Data Analisis Kompetitor',
                  description:
                    'File spreadsheet yang berisi data analisis kompetitor perusahaan',
                  url: faker.internet.domainName(),
                  file_type: 'xlsx',
                },
                {
                  title: 'Gambar Produk Lama',
                  description:
                    'Kumpulan gambar produk lama yang sudah tidak diproduksi',
                  url: faker.internet.domainName(),
                  file_type: 'zip',
                },
              ],
            },
          },
          video_contents: {
            createMany: {
              data: [
                {
                  title: 'Tutorial Pemrograman Python untuk Pemula',
                  description:
                    'Kursus video lengkap untuk mempelajari bahasa pemrograman Python dari dasar',
                  url: faker.internet.domainName(),
                  duration: '8:42:17',
                },
                {
                  title: 'Ceramah Motivasi Karir',
                  description:
                    'Rekaman ceramah motivasi tentang membangun karir yang sukses',
                  url: faker.internet.domainName(),
                  duration: '1:28:05',
                },
                {
                  title: 'Kelas Daring Kewirausahaan',
                  description:
                    'Video kelas daring yang membahas aspek-aspek kewirausahaan',
                  url: faker.internet.domainName(),
                  duration: '6:15:32',
                },
                {
                  title: 'Podcast Mingguan Teknologi',
                  description:
                    'Rekaman podcast mingguan yang membahas tren dan berita teknologi terbaru',
                  url: faker.internet.domainName(),
                  duration: '1:03:47',
                },
                {
                  title: 'Tutorial Editing Video dengan Adobe Premiere',
                  description:
                    'Kursus video yang mengajarkan cara menggunakan perangkat lunak Adobe Premiere untuk editing video',
                  url: faker.internet.domainName(),
                  duration: '9:27:15',
                },
                {
                  title: 'Webinar Pemasaran Digital',
                  description:
                    'Rekaman webinar yang membahas strategi pemasaran digital untuk bisnis',
                  url: faker.internet.domainName(),
                  duration: '2:18:42',
                },
                {
                  title: 'Podcast Kesehatan dan Kebugaran',
                  description:
                    'Episode terbaru dari podcast yang membahas topik-topik seputar kesehatan dan kebugaran',
                  url: faker.internet.domainName(),
                  duration: '0:51:28',
                },
                {
                  title: 'Tutorial Membuat Aplikasi Mobile dengan Flutter',
                  description:
                    'Kursus video yang mengajarkan cara membangun aplikasi mobile menggunakan framework Flutter',
                  url: faker.internet.domainName(),
                  duration: '10:32:09',
                },
                {
                  title: 'Ceramah Pengembangan Diri',
                  description:
                    'Rekaman ceramah yang memberikan inspirasi dan tips untuk pengembangan diri',
                  url: faker.internet.domainName(),
                  duration: '1:14:22',
                },
                {
                  title: 'Kelas Daring Desain UI/UX',
                  description:
                    'Video kelas daring yang mengajarkan prinsip-prinsip desain UI/UX untuk aplikasi dan website',
                  url: faker.internet.domainName(),
                  duration: '7:48:37',
                },
                {
                  title: 'Podcast Buku dan Literatur',
                  description:
                    'Episode terbaru dari podcast yang membahas rekomendasi buku dan ulasan literatur',
                  url: faker.internet.domainName(),
                  duration: '1:27:19',
                },
                {
                  title: 'Tutorial Pemrograman JavaScript',
                  description:
                    'Kursus video yang mengajarkan bahasa pemrograman JavaScript untuk pemula',
                  url: faker.internet.domainName(),
                  duration: '6:39:54',
                },
                {
                  title: 'Webinar Manajemen Waktu',
                  description:
                    'Rekaman webinar yang memberikan tips dan strategi untuk manajemen waktu yang efektif',
                  url: faker.internet.domainName(),
                  duration: '1:52:11',
                },
                {
                  title: 'Podcast Kuliner dan Memasak',
                  description:
                    'Episode terbaru dari podcast yang membahas resep, tips memasak, dan tren kuliner',
                  url: faker.internet.domainName(),
                  duration: '0:43:27',
                },
                {
                  title: 'Tutorial Editing Foto dengan Adobe Lightroom',
                  description:
                    'Kursus video yang mengajarkan cara menggunakan perangkat lunak Adobe Lightroom untuk editing foto',
                  url: faker.internet.domainName(),
                  duration: '5:26:49',
                },
              ],
            },
          },
          live_classes: {
            createMany: {
              data: [
                {
                  title: 'Kelas Yoga untuk Pemula',
                  description:
                    'Kelas yoga yang dirancang khusus untuk pemula yang ingin memulai gaya hidup sehat',
                  slug: StringHelper.slug('kelas-yoga-untuk-pemula'),
                  is_open: true,
                },
                {
                  title: 'Pelatihan Pengembangan Web dengan React',
                  description:
                    'Pelatihan intensif untuk mempelajari library JavaScript React untuk pengembangan aplikasi web',
                  slug: StringHelper.slug(
                    'pelatihan-pengembangan-web-dengan-react',
                  ),
                  is_open: true,
                },
                {
                  title: 'Kursus Fotografi Dasar',
                  description:
                    'Kursus yang mengajarkan dasar-dasar fotografi dan teknik pengambilan gambar untuk pemula',
                  slug: StringHelper.slug('kursus-fotografi-dasar'),
                  is_open: true,
                },
                {
                  title: 'Workshop Menulis Kreatif',
                  description:
                    'Workshop yang membantu mengembangkan keterampilan menulis kreatif dan menemukan gaya penulisan pribadi',
                  slug: StringHelper.slug('workshop-menulis-kreatif'),
                  is_open: true,
                },
                {
                  title: 'Kelas Masak Makanan Vegetarian',
                  description:
                    'Kelas memasak yang mengajarkan resep dan teknik memasak makanan vegetarian yang lezat',
                  slug: StringHelper.slug('kelas-masak-makanan-vegetarian'),
                  is_open: true,
                },
                {
                  title: 'Pelatihan Manajemen Proyek Profesional',
                  description:
                    'Pelatihan yang memberikan pengetahuan dan keterampilan untuk mengelola proyek secara profesional',
                  slug: StringHelper.slug(
                    'pelatihan-manajemen-proyek-profesional',
                  ),
                  is_open: true,
                },
                {
                  title: 'Kursus Bahasa Mandarin untuk Pemula',
                  description:
                    'Kursus yang mengajarkan dasar-dasar bahasa Mandarin bagi pemula yang ingin mempelajari bahasa ini',
                  slug: StringHelper.slug(
                    'kursus-bahasa-mandarin-untuk-pemula',
                  ),
                  is_open: true,
                },
                {
                  title: 'Workshop Desain Grafis dengan Adobe Illustrator',
                  description:
                    'Workshop yang mengajarkan teknik desain grafis menggunakan perangkat lunak Adobe Illustrator',
                  slug: StringHelper.slug(
                    'workshop-desain-grafis-dengan-adobe-illustrator',
                  ),
                  is_open: true,
                },
                {
                  title: 'Kelas Tari Modern untuk Pemula',
                  description:
                    'Kelas tari modern yang dirancang untuk pemula yang ingin mempelajari gerakan dan teknik tari modern',
                  slug: StringHelper.slug('kelas-tari-modern-untuk-pemula'),
                  is_open: true,
                },
                {
                  title: 'Pelatihan Pemasaran Digital untuk Bisnis',
                  description:
                    'Pelatihan yang memberikan pengetahuan dan strategi pemasaran digital untuk meningkatkan bisnis',
                  slug: StringHelper.slug(
                    'pelatihan-pemasaran-digital-untuk-bisnis',
                  ),
                  is_open: true,
                },
                {
                  title: 'Kursus Bermain Gitar untuk Pemula',
                  description:
                    'Kursus yang mengajarkan dasar-dasar bermain gitar bagi pemula yang ingin mempelajari alat musik ini',
                  slug: StringHelper.slug('kursus-bermain-gitar-untuk-pemula'),
                  is_open: true,
                },
                {
                  title: 'Workshop Pengembangan Aplikasi Mobile dengan Flutter',
                  description:
                    'Workshop yang mengajarkan cara membangun aplikasi mobile menggunakan framework Flutter',
                  slug: StringHelper.slug(
                    'workshop-pengembangan-aplikasi-mobile-dengan-flutter',
                  ),
                  is_open: true,
                },
                {
                  title: 'Kelas Bahasa Inggris Percakapan',
                  description:
                    'Kelas yang membantu meningkatkan keterampilan berbahasa Inggris percakapan untuk komunikasi sehari-hari',
                  slug: StringHelper.slug('kelas-bahasa-inggris-percakapan'),
                  is_open: true,
                },
                {
                  title: 'Pelatihan Kewirausahaan dan Memulai Bisnis',
                  description:
                    'Pelatihan yang memberikan pengetahuan dan keterampilan untuk memulai bisnis baru dan menjadi wirausaha',
                  slug: StringHelper.slug(
                    'pelatihan-kewirausahaan-dan-memulai-bisnis',
                  ),
                  is_open: true,
                },
                {
                  title: 'Kursus Menulis Kreatif untuk Anak-anak',
                  description:
                    'Kursus yang mengembangkan keterampilan menulis kreatif bagi anak-anak dengan cara yang menyenangkan',
                  slug: StringHelper.slug(
                    'kursus-menulis-kreatif-untuk-anak-anak',
                  ),
                  is_open: true,
                },
              ],
            },
          },
        },
      });
    }),
  );

  console.log(`Successfully created curriculums`);
};

const quiz = async () => {
  const questions = [
    {
      question: 'Apa ibu kota negara Jepang?',
      option_a: 'Tokyo',
      option_b: 'Kyoto',
      option_c: 'Osaka',
      option_d: 'Hiroshima',
      option_e: 'Nagoya',
      level: 'easy',
      answer: 'a',
    },
    {
      question: 'Siapakah penemu bola lampu?',
      option_a: 'Thomas Edison',
      option_b: 'Albert Einstein',
      option_c: 'Alexander Graham Bell',
      option_d: 'Nikola Tesla',
      option_e: 'Isaac Newton',
      level: 'easy',
      answer: 'a',
    },
    {
      question: 'Apa yang menjadi alat transportasi utama di Venesia?',
      option_a: 'Gondola',
      option_b: 'Mobil',
      option_c: 'Sepeda Motor',
      option_d: 'Kereta Api',
      option_e: 'Kapal Pesiar',
      level: 'easy',
      answer: 'a',
    },
    {
      question: 'Siapakah presiden pertama Amerika Serikat?',
      option_a: 'George Washington',
      option_b: 'Thomas Jefferson',
      option_c: 'Abraham Lincoln',
      option_d: 'Benjamin Franklin',
      option_e: 'John F. Kennedy',
      level: 'easy',
      answer: 'a',
    },
    {
      question: 'Apa ibu kota negara Perancis?',
      option_a: 'Paris',
      option_b: 'Lyon',
      option_c: 'Marseille',
      option_d: 'Toulouse',
      option_e: 'Nice',
      level: 'easy',
      answer: 'a',
    },
    {
      question: 'Berapa jumlah planet dalam tata surya?',
      option_a: '8',
      option_b: '9',
      option_c: '7',
      option_d: '10',
      option_e: '6',
      level: 'medium',
      answer: 'a',
    },
    {
      question: "Siapakah penulis novel 'Harry Potter'?",
      option_a: 'J.K. Rowling',
      option_b: 'J.R.R. Tolkien',
      option_c: 'C.S. Lewis',
      option_d: 'George R.R. Martin',
      option_e: 'Stephen King',
      level: 'medium',
      answer: 'a',
    },
    {
      question: "Siapakah pelukis terkenal dengan lukisan 'Mona Lisa'?",
      option_a: 'Leonardo da Vinci',
      option_b: 'Vincent van Gogh',
      option_c: 'Pablo Picasso',
      option_d: 'Michelangelo',
      option_e: 'Claude Monet',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Apa simbol kimia untuk emas?',
      option_a: 'Au',
      option_b: 'Ag',
      option_c: 'Fe',
      option_d: 'Cu',
      option_e: 'Pt',
      level: 'medium',
      answer: 'a',
    },
    {
      question:
        "Siapakah tokoh dalam filsafat yang dikenal dengan 'I think, therefore I am'?",
      option_a: 'Rene Descartes',
      option_b: 'Socrates',
      option_c: 'Plato',
      option_d: 'Aristotle',
      option_e: 'Immanuel Kant',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Apa yang merupakan ibu kota negara Australia?',
      option_a: 'Canberra',
      option_b: 'Sydney',
      option_c: 'Melbourne',
      option_d: 'Perth',
      option_e: 'Brisbane',
      level: 'easy',
      answer: 'a',
    },
    {
      question: "Siapakah penulis tragedi 'Romeo dan Juliet'?",
      option_a: 'William Shakespeare',
      option_b: 'Charles Dickens',
      option_c: 'Jane Austen',
      option_d: 'Mark Twain',
      option_e: 'Emily Bronte',
      level: 'easy',
      answer: 'a',
    },
    {
      question: 'Apa yang merupakan lambang dari zodiak Taurus?',
      option_a: 'Banteng',
      option_b: 'Kambing',
      option_c: 'Sapi',
      option_d: 'Singa',
      option_e: 'Domba',
      level: 'easy',
      answer: 'a',
    },
    {
      question: 'Siapakah penemu teori relativitas?',
      option_a: 'Albert Einstein',
      option_b: 'Isaac Newton',
      option_c: 'Nikola Tesla',
      option_d: 'Galileo Galilei',
      option_e: 'Stephen Hawking',
      level: 'easy',
      answer: 'a',
    },
    {
      question:
        'Apa yang merupakan nama dari gajah terbesar yang pernah hidup?',
      option_a: 'Paraceratherium',
      option_b: 'Tyrannosaurus Rex',
      option_c: 'Brachiosaurus',
      option_d: 'Triceratops',
      option_e: 'Stegosaurus',
      level: 'easy',
      answer: 'a',
    },
    {
      question: 'Berapa jumlah provinsi di Indonesia?',
      option_a: '34',
      option_b: '33',
      option_c: '35',
      option_d: '32',
      option_e: '31',
      level: 'medium',
      answer: 'b',
    },
    {
      question: "Siapakah penulis novel '1984'?",
      option_a: 'George Orwell',
      option_b: 'F. Scott Fitzgerald',
      option_c: 'Ernest Hemingway',
      option_d: 'J.D. Salinger',
      option_e: 'Harper Lee',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Apa yang menjadi julukan kota New York?',
      option_a: 'The Big Apple',
      option_b: 'The Windy City',
      option_c: 'The City of Angels',
      option_d: 'The Emerald City',
      option_e: 'The Motor City',
      level: 'medium',
      answer: 'a',
    },
    {
      question:
        "Siapakah presiden Amerika Serikat yang terkenal sebagai 'ayah bangsa'?",
      option_a: 'George Washington',
      option_b: 'Thomas Jefferson',
      option_c: 'Abraham Lincoln',
      option_d: 'Benjamin Franklin',
      option_e: 'John Adams',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Apa nama ilmiah dari manusia modern?',
      option_a: 'Homo sapiens',
      option_b: 'Homo erectus',
      option_c: 'Homo habilis',
      option_d: 'Australopithecus afarensis',
      option_e: 'Neanderthal',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Siapakah penemu telepon?',
      option_a: 'Alexander Graham Bell',
      option_b: 'Thomas Edison',
      option_c: 'Nikola Tesla',
      option_d: 'Guglielmo Marconi',
      option_e: 'Samuel Morse',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Apa yang merupakan simbol kimia untuk air?',
      option_a: 'H2O',
      option_b: 'CO2',
      option_c: 'O2',
      option_d: 'NaCl',
      option_e: 'CH4',
      level: 'medium',
      answer: 'a',
    },
    {
      question: "Siapakah pelukis terkenal dengan lukisan 'The Starry Night'?",
      option_a: 'Vincent van Gogh',
      option_b: 'Leonardo da Vinci',
      option_c: 'Pablo Picasso',
      option_d: 'Claude Monet',
      option_e: 'Michelangelo',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Apa yang merupakan benua terbesar di dunia?',
      option_a: 'Asia',
      option_b: 'Afrika',
      option_c: 'Amerika Utara',
      option_d: 'Antartika',
      option_e: 'Eropa',
      level: 'medium',
      answer: 'a',
    },
    {
      question: "Siapakah penulis novel 'To Kill a Mockingbird'?",
      option_a: 'Harper Lee',
      option_b: 'F. Scott Fitzgerald',
      option_c: 'Ernest Hemingway',
      option_d: 'J.D. Salinger',
      option_e: 'Mark Twain',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Apa yang merupakan lambang dari zodiak Gemini?',
      option_a: 'Dua Bersaudara',
      option_b: 'Babi Hutan',
      option_c: 'Sapi',
      option_d: 'Singa',
      option_e: 'Domba',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Siapakah presiden pertama Rusia setelah runtuhnya Uni Soviet?',
      option_a: 'Boris Yeltsin',
      option_b: 'Vladimir Putin',
      option_c: 'Mikhail Gorbachev',
      option_d: 'Vladimir Lenin',
      option_e: 'Joseph Stalin',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Apa yang menjadi nama jalan terkenal di Paris?',
      option_a: 'Champs-Élysées',
      option_b: 'Broadway',
      option_c: 'Oxford Street',
      option_d: 'Rodeo Drive',
      option_e: 'Fifth Avenue',
      level: 'medium',
      answer: 'a',
    },
    {
      question: "Siapakah penulis novel 'Pride and Prejudice'?",
      option_a: 'Jane Austen',
      option_b: 'Charlotte Bronte',
      option_c: 'Emily Dickinson',
      option_d: 'Mary Shelley',
      option_e: 'Virginia Woolf',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Apa yang menjadi nama pulau terbesar di dunia?',
      option_a: 'Greenland',
      option_b: 'Madagascar',
      option_c: 'Borneo',
      option_d: 'Sumatra',
      option_e: 'Sulawesi',
      level: 'medium',
      answer: 'a',
    },
    {
      question:
        "Siapakah tokoh dalam sejarah yang terkenal dengan 'I have a dream'?",
      option_a: 'Martin Luther King Jr.',
      option_b: 'Abraham Lincoln',
      option_c: 'Nelson Mandela',
      option_d: 'Winston Churchill',
      option_e: 'Mahatma Gandhi',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Siapakah penemu listrik?',
      option_a: 'Thomas Edison',
      option_b: 'Nikola Tesla',
      option_c: 'Alexander Graham Bell',
      option_d: 'Albert Einstein',
      option_e: 'Benjamin Franklin',
      level: 'easy',
      answer: 'b',
    },
    {
      question: 'Berapakah jumlah warna pada pelangi?',
      option_a: '5',
      option_b: '6',
      option_c: '7',
      option_d: '8',
      option_e: '9',
      level: 'easy',
      answer: 'c',
    },
    {
      question: 'Siapakah penemu gravitasi?',
      option_a: 'Isaac Newton',
      option_b: 'Galileo Galilei',
      option_c: 'Albert Einstein',
      option_d: 'Stephen Hawking',
      option_e: 'Nikola Tesla',
      level: 'easy',
      answer: 'a',
    },
    {
      question: 'Apa yang merupakan alat musik tiup?',
      option_a: 'Gitar',
      option_b: 'Biola',
      option_c: 'Saxophone',
      option_d: 'Drum',
      option_e: 'Piano',
      level: 'easy',
      answer: 'c',
    },
    {
      question: 'Berapakah jumlah huruf dalam alfabet Inggris?',
      option_a: '25',
      option_b: '26',
      option_c: '27',
      option_d: '28',
      option_e: '29',
      level: 'easy',
      answer: 'b',
    },
    {
      question: "Siapakah penulis novel 'The Catcher in the Rye'?",
      option_a: 'J.D. Salinger',
      option_b: 'F. Scott Fitzgerald',
      option_c: 'Harper Lee',
      option_d: 'George Orwell',
      option_e: 'Ernest Hemingway',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Apa yang menjadi julukan kota Paris?',
      option_a: 'City of Lights',
      option_b: 'City of Love',
      option_c: 'City of Bridges',
      option_d: 'City of Canals',
      option_e: 'City of Angels',
      level: 'hard',
      answer: 'a',
    },
    {
      question:
        'Siapakah presiden Amerika Serikat yang terkenal karena memerintahkan pembangunan Tembok Berlin?',
      option_a: 'John F. Kennedy',
      option_b: 'Richard Nixon',
      option_c: 'Ronald Reagan',
      option_d: 'Jimmy Carter',
      option_e: 'Dwight D. Eisenhower',
      level: 'hard',
      answer: 'c',
    },
    {
      question: 'Apa yang menjadi nama jalan terkenal di London?',
      option_a: 'Oxford Street',
      option_b: 'Broadway',
      option_c: 'Champs-Élysées',
      option_d: 'Rodeo Drive',
      option_e: 'Fifth Avenue',
      level: 'hard',
      answer: 'a',
    },
    {
      question: "Siapakah penulis novel 'The Great Gatsby'?",
      option_a: 'F. Scott Fitzgerald',
      option_b: 'Ernest Hemingway',
      option_c: 'J.D. Salinger',
      option_d: 'Harper Lee',
      option_e: 'Mark Twain',
      level: 'medium',
      answer: 'a',
    },
    {
      question: 'Apa yang menjadi julukan kota Roma?',
      option_a: 'The Eternal City',
      option_b: 'The City of Love',
      option_c: 'The Windy City',
      option_d: 'The City of Angels',
      option_e: 'The Big Apple',
      level: 'hard',
      answer: 'a',
    },
    {
      question: "Siapakah pelukis terkenal dengan karya 'The Last Supper'?",
      option_a: 'Leonardo da Vinci',
      option_b: 'Vincent van Gogh',
      option_c: 'Pablo Picasso',
      option_d: 'Claude Monet',
      option_e: 'Michelangelo',
      level: 'hard',
      answer: 'a',
    },
    {
      question: 'Apa yang menjadi nama sungai terpanjang di dunia?',
      option_a: 'Amazon',
      option_b: 'Nile',
      option_c: 'Yangtze',
      option_d: 'Mississippi',
      option_e: 'Danube',
      level: 'hard',
      answer: 'a',
    },
    {
      question: "Siapakah penulis novel 'Moby-Dick'?",
      option_a: 'Herman Melville',
      option_b: 'Mark Twain',
      option_c: 'Jules Verne',
      option_d: 'Joseph Conrad',
      option_e: 'Leo Tolstoy',
      level: 'hard',
      answer: 'a',
    },
    {
      question:
        'Apa yang menjadi nama danau terbesar di dunia berdasarkan volume?',
      option_a: 'Baikal',
      option_b: 'Titicaca',
      option_c: 'Victoria',
      option_d: 'Superior',
      option_e: 'Michigan',
      level: 'hard',
      answer: 'a',
    },
    {
      question: "Siapakah penulis drama 'Hamlet'?",
      option_a: 'William Shakespeare',
      option_b: 'Christopher Marlowe',
      option_c: 'Ben Jonson',
      option_d: 'John Donne',
      option_e: 'Thomas Middleton',
      level: 'hard',
      answer: 'a',
    },
    {
      question: 'Apa yang menjadi nama gunung tertinggi di dunia?',
      option_a: 'Everest',
      option_b: 'K2',
      option_c: 'Kangchenjunga',
      option_d: 'Lhotse',
      option_e: 'Makalu',
      level: 'hard',
      answer: 'a',
    },
    {
      question:
        "Siapakah presiden Amerika Serikat yang terkenal sebagai 'pemimpin terjun bebas'?",
      option_a: 'Theodore Roosevelt',
      option_b: 'Franklin D. Roosevelt',
      option_c: 'Woodrow Wilson',
      option_d: 'Herbert Hoover',
      option_e: 'Harry S. Truman',
      level: 'hard',
      answer: 'a',
    },
    {
      question: 'Apa yang menjadi nama bentuk geometri dengan delapan sisi?',
      option_a: 'Oktagon',
      option_b: 'Segi Enam',
      option_c: 'Trapesium',
      option_d: 'Persegi Panjang',
      option_e: 'Lingkaran',
      level: 'hard',
      answer: 'a',
    },
    {
      question:
        'Siapakah presiden Amerika Serikat yang terkenal dengan program New Deal?',
      option_a: 'Franklin D. Roosevelt',
      option_b: 'Herbert Hoover',
      option_c: 'Theodore Roosevelt',
      option_d: 'Harry S. Truman',
      option_e: 'Woodrow Wilson',
      level: 'hard',
      answer: 'a',
    },
  ];

  const courses = await prisma.course.findMany({
    include: {
      curriculums: true,
    },
  });

  await Promise.all(
    courses.map(async (course) => {
      const quiz = await prisma.quiz.create({
        data: {
          title: faker.music.songName(),
          curriculum: {
            connect: {
              id: faker.helpers.shuffle(course.curriculums)[0].id,
            },
          },
          duration: 60,
          is_active: true,
          is_ended: false,
          pass_grade: 70,
          show_result: faker.datatype.boolean(),
          option_generated: {
            create: {
              easy: 5,
              medium: 5,
              hard: 5,
              total_question: 15,
            },
          },
        },
      });

      await Promise.all(
        questions.map(async (question) => {
          await prisma.question.create({
            data: {
              option_a: question.option_a,
              option_b: question.option_b,
              option_c: question.option_c,
              option_d: question.option_d,
              option_e: question.option_e,
              question: question.question,
              question_type: 'single_choice',
              level: question.level as any,
              curriculum_id: faker.helpers.shuffle(course.curriculums)[0].id,
              quiz_id: quiz.id,
              answer: { create: { answer: question.answer } },
            },
          });
        }),
      );
    }),
  );

  console.log(`Successfully created quiz for each courses`);
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
