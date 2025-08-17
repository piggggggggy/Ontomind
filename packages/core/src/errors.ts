export class OntoMindError extends Error {
    constructor(message: string, public issues: string[] = []) { super(message); }
}
  
export class ValidationError extends OntoMindError {}