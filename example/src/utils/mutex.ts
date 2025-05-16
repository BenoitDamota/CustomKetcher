export class Mutex {
  private _locking: Promise<void> = Promise.resolve();
  private _unlock!: () => void;

  async lock(): Promise<() => void> {
    let unlockNext!: () => void;

    const willLock = new Promise<void>((resolve) => {
      unlockNext = resolve;
    });

    const previousLock = this._locking;

    this._locking = previousLock.then(() => willLock);

    await previousLock;

    return () => {
      unlockNext();
    };
  }
}
