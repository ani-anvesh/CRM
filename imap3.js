/* {
    "name": "My Name",
    "email": "user@domain.com",
    "username": "user@gmail.com",
    "password": "MYPASSWORD",
    "imap": {
        "host": "imap.gmail.com",
        "port": 993,
        "secure": true
    },
    "smtp": {
        "host": "smtp.gmail.com",
        "ssl": true
    }
} */

imap = require("imap");
mailparser = require("mailparser")



server = new imap.ImapConnection({user: "postboxme.117@gmail.com",
password: "anveshreddy@117",
    host: "smtp.gmail.com",
    port: 993,
    secure: true,
})
exitOnErr = (err) =>{
    console.error (err)
    do process.exit
}
server.connect (err) ={
    exitOnErr err if err
    server.openBox "INBOX", false, (err, box) ->
        exitOnErr err if err
        console.log "You have #{box.messages.total} messages in your INBOX"

        server.search ["UNSEEN", ["SINCE", "Sep 18, 2011"], ["FROM", config.email]], (err, results) ->
            exitOnErr err if err

            unless results.length
                console.log "No unread messages from #{config.email}"
                do server.logout
                return

            fetch = server.fetch results,
                request:
                    body: "full"
                    headers: false
            
            fetch.on "message", (message) ->
                fds = {}
                filenames = {}
                parser = new mailparser.MailParser

                parser.on "headers", (headers) ->
                    console.log "Message: #{headers.subject}"

                parser.on "astart", (id, headers) ->
                    filenames[id] = headers.filename
                    fds[id] = fs.openSync headers.filename, 'w'

                parser.on "astream", (id, buffer) ->
                    fs.writeSync fds[id], buffer, 0, buffer.length, null

                parser.on "aend", (id) ->
                    return unless fds[id]
                    fs.close fds[id], (err) ->
                        return console.error err if err
                        console.log "Writing #{filenames[id]} completed"

                message.on "data", (data) ->
                    parser.feed data.toString()

                message.on "end", ->
                    do parser.end

            fetch.on "end", ->
                do server.logout