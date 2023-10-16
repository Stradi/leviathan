export default class TrackerError {
  private message: string;

  constructor(opts: { message: string }) {
    this.message = opts.message;
  }

  public getMessage(): string {
    return this.message;
  }
}
