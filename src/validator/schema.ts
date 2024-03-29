import {
    ArrayMaxSize,
    ArrayUnique,
    IsArray,
    IsBooleanString,
    IsDateString,
    IsEmail,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
    Length,
    MaxLength,
    MinLength,
} from "class-validator";

export class UserSignUpBody {
    @Length(3, 30)
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(5)
    password: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName: string;

    @IsOptional()
    @IsDateString()
    dob?: Date;

    @IsOptional()
    @IsString()
    country?: string;
}

export class UserLoginBody {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(5)
    password: string;
}

export class UserUpdateBody {
    @IsOptional()
    @Length(3, 30)
    username?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;
}

export class CreatePostBody {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    title?: string;

    @IsOptional()
    @IsBooleanString()
    sensitive?: boolean;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(5)
    @ArrayUnique()
    @IsString({ each: true })
    @Length(1, 15, { each: true })
    tags?: string[];
}

export class CreateCommentBody {
    @IsString()
    @MaxLength(1000)
    message: string;

    @IsOptional()
    @IsNumber()
    tagTo?: number;
}

export class UpdateCommentBody {
    @IsString()
    @MinLength(1)
    @MaxLength(1000)
    message: string;

    @IsOptional()
    @IsNumber()
    tagTo?: number;
}

export class ParamId {
    @IsNumberString()
    id: number;
}

/**
 *  Objects
 * */

// export const googleTokenPayload = {
//     googleId: Joi.string().required(),
//     name: Joi.string().required(),
//     email: Joi.string().required(),
//     username: Joi.string().required(),
//     firsName: Joi.string().required(),
//     lastName: Joi.string().required(),
//     avatarUrl: Joi.string().required(),
// };
