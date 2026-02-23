import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestWithMedplumCredentials } from "../guards/patient-auth/patient-auth.guard";

export const MedplumSecrets = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest<RequestWithMedplumCredentials>();
        return req.medplumCredentials;
    },
);