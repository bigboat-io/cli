const Vorpal = require('vorpal')

const tableStyle = {
    chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
        , 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
        , 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
        , 'right': '', 'right-mid': '', 'middle': ' '
    },
    style: { 'padding-left': 0, 'padding-right': 5, head: [] }
}

const commands = [
    './commands/app',
    './commands/instance',
    './commands/bucket',
]

vorpal = Vorpal()

if(!process.env.BIGBOAT_API){
    vorpal.log('Environment variable BIGBOAT_API not set.')
    process.exit(1)
}

const client = require('./graphql-client')(process.env.BIGBOAT_API)
for(command of commands){
    vorpal.use(require(command)({ client, tableStyle }))
}

if(process.argv.length > 2){
    // non interactive
    vorpal.exec(process.argv.slice(2).join(' '));
} else {
    // interactive
    vorpal.log(`Connected to ${process.env.BIGBOAT_API}`)
    vorpal.delimiter('BigBoat CLI />')
    vorpal.show().parse(process.argv);
}