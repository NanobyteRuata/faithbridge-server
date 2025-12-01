import { Profile, Role, User } from '@prisma/client';

export class RegisterResponseDto {
  email: string;
  role: Partial<Role>;
  profile: Partial<Profile>;

  constructor(user: User & { role: Role | null; profile: Profile }) {
    this.email = user.email;
    this.role = {
      id: user.role?.id,
      name: user.role?.name,
    };
    this.profile = {
      id: user.profileId,
      title: user.profile.title,
      name: user.profile.name,
      lastName: user.profile.lastName,
      nickName: user.profile.nickName,
      membershipId: user.profile.membershipId,
      personalEmail: user.profile.personalEmail,
      workEmail: user.profile.workEmail,
      personalPhone: user.profile.personalPhone,
      homePhone: user.profile.homePhone,
      otherContact1Type: user.profile.otherContact1Type,
      otherContact1: user.profile.otherContact1,
      otherContact2Type: user.profile.otherContact2Type,
      otherContact2: user.profile.otherContact2,
      otherContact3Type: user.profile.otherContact3Type,
      otherContact3: user.profile.otherContact3,
    };
  }
}
