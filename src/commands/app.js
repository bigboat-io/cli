const fs = require("fs");
const Table = require("cli-table3");

module.exports = ({ client, tableStyle }) => (vorpal, options) => {
  vorpal
    .command("app ls", "List applications.")
    .action(async function(args, callback) {
      try {
        const apps = await client.apps.list();
        const table = new Table(
          Object.assign({ head: ["ID", "NAME", "VERSION", "TAGS"] }, tableStyle)
        );
        for (app of apps) {
          table.push([
            app.id,
            app.name,
            app.version,
            app.tags ? app.tags.join(",") : ""
          ]);
        }
        this.log(table.toString());
        callback && callback();
      } catch (error) {
        console.error(error.message);
      }
    });
  vorpal
    .command("app rm <name:version>", "Remove an application.")
    .action(async function(args, callback) {
      const [appName, appVersion] = args["name:version"].split(":");
      try {
        const app = await client.apps.remove(appName, appVersion);
        this.log(app);
        callback && callback();
      } catch (error) {
        console.error(error.message);
      }
    });
  vorpal
    .command(
      "app create <docker-compose-file> <bigboat-compose-file> <name:version>",
      "Create or update an application."
    )
    // .option("-d, --docker-compose <path>", "Path to the Docker Compose file.")
    // .option("-b, --bigboat-compose <path>", "Path to the BigBoat Compose file.")
    .action(async function(args, callback) {
      const [appName, appVersion] = args["name:version"].split(":");
      const dockerComposeFile = args["docker-compose-file"];
      const bigboatComposeFile = args["bigboat-compose-file"];
      try {
        const app = await client.apps.createOrUpdate(
          appName,
          appVersion,
          fs.readFileSync(dockerComposeFile, { encoding: "utf8" }),
          fs.readFileSync(bigboatComposeFile, { encoding: "utf8" })
        );
        this.log(app.id);
        callback && callback();
      } catch (error) {
        console.error(error.message);
      }
    });
};
