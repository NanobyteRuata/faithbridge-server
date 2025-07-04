import { Profile, Role, User } from '@prisma/client';

export class RegisterResponseDto {
  username: string;
  email: string;
  phone: string | null;
  role: Partial<Role>;
  profile: Partial<Profile>;

  constructor(user: User & { role: Role; profile: Profile }) {
    this.username = user.username;
    this.email = user.email;
    this.phone = user.phone;
    this.role = {
      id: user.roleId,
      name: user.role.name,
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
      workPhone: user.profile.workPhone,
      otherContact1Type: user.profile.otherContact1Type,
      otherContact1: user.profile.otherContact1,
      otherContact2Type: user.profile.otherContact2Type,
      otherContact2: user.profile.otherContact2,
      otherContact3Type: user.profile.otherContact3Type,
      otherContact3: user.profile.otherContact3,
    };
  }
}
