export enum NotificationType {
  course_new_video,
  course_new_file,
  course_new_live_class,
  course_new_quiz,
  course_new_certificate,
  course_reminder_quiz,
  course_live_class_open,
  course_enrollment_free_success,
  transaction_waiting_payment,
  transaction_success_payment,
  transaction_error_payment,
}

export const notificationWording = (notificationType: NotificationType) => {
  switch (notificationType) {
    case NotificationType.course_new_video:
      return {
        type: 'course_new_video',
        title: 'Mata Kuliah',
        body: 'Jelajahi materi terbaru kami! Video pembelajaran terkini sudah siap untuk Anda nikmati. Segera akses dan tingkatkan pengetahuan Anda di dalam kursus online kami. Happy learning! 📚',
      };
    case NotificationType.course_new_file:
      return {
        type: 'course_new_file',
        title: 'Mata Kuliah',
        body: 'Ada file baru yang telah berhasil diunggah ke dalam kursus online Anda. Jangan lewatkan kesempatan untuk mengakses materi terkini ini. Silakan cek segera dan manfaatkan informasi terbaru yang telah disiapkan untuk Anda. Terima kasih! 📂',
      };
    case NotificationType.course_new_live_class:
      return {
        type: 'course_new_live_class',
        title: 'Mata Kuliah',
        body: 'Kami senang memberitahu Anda bahwa ada jadwal rapat online baru yang telah ditetapkan. Pastikan untuk mengikuti sesi ini untuk mendapatkan informasi terkini dan terlibat dalam diskusi yang bermanfaat. Sampai jumpa di sana!',
      };
    case NotificationType.course_new_quiz:
      return {
        type: 'course_new_quiz',
        title: 'Mata Kuliah',
        body: 'Selamat! Ada kuis baru yang sudah disiapkan untuk meningkatkan pemahaman Anda dalam materi kursus. Ayo segera uji pengetahuan Anda dan dapatkan hasil yang memuaskan. Semangat mengerjakan kuis!',
      };
    case NotificationType.course_new_certificate:
      return {
        type: 'course_new_certificate',
        title: 'Mata Kuliah',
        body: 'Selamat! Anda telah berhasil menyelesaikan kursus ini dengan baik. Sertifikat pencapaian Anda sudah dapat diunduh. Teruskan perjalanan pembelajaran Anda dan jangan ragu untuk menjelajahi kursus lainnya. Sukses selalu! 🎓',
      };
    case NotificationType.course_reminder_quiz:
      return {
        type: 'course_reminder_quiz',
        title: 'Mata Kuliah',
        body: 'Waktunya mendekati! Quiz akan segera dimulai dalam 5 menit. Semangat mengerjakan dan raih nilai tertinggi! 🧠✨',
      };
    case NotificationType.course_live_class_open:
      return {
        type: 'course_live_class_open',
        title: 'Mata Kuliah',
        body: 'Online meeting kita sudah dibuka. Ayo bergabung dan jangan lewatkan kesempatan untuk berinteraksi, belajar, dan berdiskusi bersama. Sambutlah wawasan baru dan nikmati sesi ini! 🤝🖥️',
      };
    case NotificationType.course_enrollment_free_success:
      return {
        type: 'course_enrollment_free_success',
        title: 'Mata Kuliah',
        body: 'Selamat! Anda berhasil terdaftar dalam kursus kami. Mulailah perjalanan pembelajaran Anda sekarang. Akses materi kursus, ikuti tugas, dan tingkatkan pengetahuan Anda. Selamat belajar! 🎓',
      };
    case NotificationType.transaction_waiting_payment:
      return {
        type: 'transaction_waiting_payment',
        title: 'Transaksi',
        body: 'Pesanan Anda sedang menunggu konfirmasi pembayaran. Silakan pastikan Anda telah menyelesaikan proses pembayaran agar dapat segera mengakses konten kursus yang Anda pilih.',
      };
    case NotificationType.transaction_success_payment:
      return {
        type: 'transaction_success_payment',
        title: 'Transaksi',
        body: 'Terima kasih atas pembayaran Anda! Pembayaran Anda telah berhasil dikonfirmasi. Anda sekarang dapat menikmati akses penuh ke kursus online kami. Selamat belajar! 🎉',
      };
    case NotificationType.transaction_error_payment:
      return {
        type: 'transaction_error_payment',
        title: 'Transaksi',
        body: 'Maafkan ketidaknyamanan ini. Transaksi Anda tidak dapat diproses saat ini karena adanya kesalahan pada server kami. Mohon coba lagi nanti atau hubungi tim dukungan kami untuk bantuan lebih lanjut. Terima kasih atas pemahaman Anda. 🛠️',
      };
  }
};
