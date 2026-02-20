import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/iam/domain/enums/role.enum';

export class UserProfileResult {
    @ApiProperty({
        example: 1,
        description: 'The unique identifier of the user',
    })
    id: number;

    @ApiProperty({
        example: 'John',
        description: 'The first name of the user',
    })
    firstName: string;

    @ApiProperty({
        example: 'Doe',
        description: 'The last name of the user',
    })
    lastName: string;

    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'The email address of the user',
    })
    email: string;

    @ApiProperty({
        enum: Role,
        example: Role.USER,
        description: 'The role assigned to the user',
    })
    role: Role;
}
