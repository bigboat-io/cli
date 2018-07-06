const Table = require("cli-table3");

module.exports = ({ client, tableStyle }) => (vorpal, options) => {
  vorpal
    .command("bucket ls", "List data buckets.")
    .action(async function(args, callback) {
      try {
        const buckets = await client.buckets.list();
        const table = new Table(
          Object.assign({ head: ["ID", "NAME", "LOCKED"] }, tableStyle)
        );
        for (bucket of buckets) {
          table.push([bucket.id, bucket.name, bucket.isLocked]);
        }
        this.log(table.toString());
        callback && callback();
      } catch (error) {
        console.error(error.message);
      }
    });
  vorpal
    .command("bucket rm <name>", "Remove bucket.")
    .action(async function(args, callback) {
      try {
        const bucket = await client.buckets.remove(args.name);
        this.log(bucket);
        callback && callback();
      } catch (error) {
        console.error(error.message);
      }
    });
  vorpal
    .command("bucket cp <source> <destination>", "Copy bucket.")
    .action(async function(args, callback) {
      try {
        const bucket = await client.buckets.copy(args.source, args.destination);
        this.log(bucket);
        callback && callback();
      } catch (error) {
        console.error(error.message);
      }
    });
};
