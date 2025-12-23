import { CurrentUser } from 'src/auth/types/current-user';

export class InvitePractitionerCommand {
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly currentUser: CurrentUser;

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    currentUser: CurrentUser,
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.currentUser = currentUser;
  }
}
