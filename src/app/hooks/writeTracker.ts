// The tab and global stores broadcast every change, including echoes of this
// UI's own writes. Echoes arrive late, sometimes twice (Firefox relays them
// through the background), so a fast run of writes ("a", "ab", "abc") can be
// overwritten by the echo of an earlier one. Each write carries an id that the
// store echoes back. An echo of anything but this UI's latest write is stale.
// While the latest write is unconfirmed, other broadcasts are stale too: they
// describe a value the store is about to replace.
export function createWriteTracker() {
  const clientId = crypto.randomUUID();
  let nextSeq = 0;
  const latest = new Map<string, { seq: number; confirmed: boolean }>();

  return {
    begin(property: string): string {
      const seq = ++nextSeq;
      latest.set(property, { seq, confirmed: false });
      return `${clientId}:${seq}`;
    },

    shouldApply(property: string, writeId: string | undefined): boolean {
      const write = latest.get(property);
      if (!write) return true;
      const [writer, seq] = writeId?.split(":") ?? [];
      if (writer !== clientId) return write.confirmed;
      if (Number(seq) !== write.seq) return false;
      write.confirmed = true;
      return true;
    },

    abandon(property: string, writeId: string) {
      const write = latest.get(property);
      if (write && writeId === `${clientId}:${write.seq}`) {
        write.confirmed = true;
      }
    },
  };
}
