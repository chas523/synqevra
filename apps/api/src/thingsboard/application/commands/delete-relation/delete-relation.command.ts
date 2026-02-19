export class DeleteRelationCommand {
    constructor(
        public readonly fromId: string,
        public readonly fromType: string,
        public readonly relationType: string,
        public readonly toId: string,
        public readonly toType: string,
        public readonly accessToken: string,
    ) { }
}
