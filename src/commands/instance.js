const Table = require('cli-table3')
const colors = require('colors')

const v = (val) => val ? val : ''
const colorMap = {
    running: colors.green,
    failing: colors.red
}
const stateColor = (state) => colorMap[state] ? colorMap[state](state) : state

module.exports = ({ client, tableStyle }) => (vorpal, options) => {
    vorpal.command('instance ls', 'List instances.').action(function (args, callback) {
        client.instances.list().then(instances => {
            const table = new Table(Object.assign({ head: ['ID', 'NAME', 'APP', 'STORAGE BUCKET', 'STATE', 'SERVICES'] }, tableStyle))
            for (inst of instances) {
                table.push([inst.id, inst.name, `${inst.app.name}:${inst.app.version}`, v(inst.storageBucket), stateColor(v(inst.state)), inst.services.length])
            }
            this.log(table.toString())
            callback()
        }).catch(error => {
            this.log(error.graphQLErrors[0].message)
            callback()
        })
    })
    vorpal.command('instance start <name> <app>', 'Create a new instance based on an application.').action(function (args, callback) {
        const appName = args.app.split(':')[0]
        const appVersion = args.app.split(':')[1]
        client.instances.start(args.name, appName, appVersion).then(instance => {
            this.log(instance.id)
            callback()
        }).catch(error => {
            this.log(error.graphQLErrors[0].message)
            callback()
        });
    })
    vorpal.command('instance stop <name>', 'Stop a running instance.').action(function (args, callback){
        client.instances.stop(args.name).then(instance => {
            this.log(instance.id)
            callback()
        }).catch(error => {
            this.log(error.graphQLErrors[0].message)
            callback()
        });
    })
    vorpal.command('instance inspect <name>', 'Show instance details.').action(function (args, callback) {
        client.instances.list().then(instances => {
            for(inst of instances){
                if(inst.name === args.name){
                    const inst_ = deepMap(inst, (val) => {
                        delete val.__typename
                        return val
                    })
                    delete inst_.__typename
                    this.log(JSON.stringify(inst_, null, 4))
                    callback()
                    return
                }
            }
            this.log(`Instance ${args.name} does not exist.`)
            callback()
        })
    })
}

const deepMap = (obj, f, ctx) => {
    if (Array.isArray(obj)) {
        return obj.map(function (val, key) {
            if (typeof val === 'object') {
                return f.call(ctx, deepMap(val, f, ctx), key)
            } else {
                return val
            }
        });
    } else if (typeof obj === 'object') {
        var res = {};
        for (var key in obj) {
            var val = obj[key];
            if (typeof val === 'object') {
                res[key] = deepMap(val, f, ctx);
                res[key] = f.call(ctx, res[key], key);
            }else{
                res[key] = val
            }
        }
        return res;
    } else {
        return obj;
    }
}
