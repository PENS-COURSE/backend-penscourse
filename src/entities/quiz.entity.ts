import { $Enums, Prisma } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

type QuestionType = Prisma.QuestionGetPayload<{
  include: {
    answer: true;
  };
}>;

export class QuestionEntity implements QuestionType {
  constructor(partial: Partial<QuestionEntity>) {
    Object.assign(this, partial);
  }

  @Expose({ groups: ['detail'] })
  answer: {
    id: string;
    question_id: string;
    answer: string;
    created_at: Date;
    updated_at: Date;
  }[];

  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  question_type: $Enums.QuestionType;

  @Expose({ groups: ['detail'] })
  quiz_id: string;

  @Expose({ groups: ['detail'] })
  level: $Enums.Level;

  @Expose({ groups: ['detail'] })
  curriculum_id: string;

  @Expose({ groups: ['detail'] })
  created_at: Date;

  @Expose({ groups: ['detail'] })
  updated_at: Date;
}

type QuizSessionType = Prisma.QuizSessionGetPayload<{
  include: {
    user: true;
  };
}>;

export class QuizSession implements QuizSessionType {
  constructor(partial: Partial<QuizSession>) {
    Object.assign(this, partial);
  }

  @Exclude()
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: Date;
    google_id: string;
    password: string;
    avatar: string;
    role: $Enums.Role;
    created_at: Date;
    updated_at: Date;
  };

  id: string;
  user_id: number;
  quiz_id: string;
  score: number;
  is_ended: boolean;
  created_at: Date;
  updated_at: Date;

  @Expose({ name: 'user' })
  get getUser() {
    return {
      id: this.user?.id,
      name: this.user?.name,
      email: this.user?.email,
      avatar: this.user?.avatar,
      role: this.user?.role,
    };
  }
}
