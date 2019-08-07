const socket = require("socket.io-client")("http://windows93.net:8081");
const he = require("he"); // For parsing HTML symbols

function send(message) {
  socket.emit(
    "message",
    message+"\n"+
    // To stop message being blocked, random number
    "ID: "+Math.random()*100
  );
}

function box(text, title) {
  // Sets box width to length of longest string in array
  var w = text.slice().sort((a, b) => b.length-a.length)[0].length;
  // If title was specified it also needs to fit in the box
  if (title !== undefined) {
    if (title.length > w) {
      w = title.length;
    }
  }
  // Makes box lines size of width
  var t = "o-"+("─".repeat(w))+"-o\n"
  if (title !== undefined) {
    t += "| "+title.padEnd(w)+" |\n"+
         "|-"+("─".repeat(w))+"-|\n";
  }
  text.forEach(x => t += "| "+x.padEnd(w)+" |\n");
  t += "o-"+("─".repeat(w))+"-o";
  return t;
}

socket.on("message", data => {
  if (data.msg.toLowerCase().startsWith("e?")) {
    // Removes prefix from command
    data.msg = data.msg.substring(2);
    if (data.msg.startsWith("help")) {
      send(box(["e?help", "e?nickname", "e?border"].sort(), "Commands:"));
    } else if (data.msg.startsWith("nickname")) {
      // Makes sure nickname is a string
      if (typeof data.nick === 'string') {
        // he.decode fixes symbols not displaying
        send(box([he.decode(data.nick)], "Nickname:"));
      }
    } else if (data.msg.startsWith("border")) {
      // Makes sure box message is a string
        if (typeof data.msg === 'string') {
          // Fixes symbols, removes 'border' command from box
          send(box(he.decode(data.msg.substring(7)).split('\n')));
        }
    } else {
      send(box(["Command not found.","Try e?help"], "Oops:"));
    }
  }
});

socket.on('user joined', data => {
  // Makes sure nickname is a string
  if (typeof data.nick === 'string') {
    send(box(
      // he.decode fixes symbols not displaying
      [+he.decode(data.nick)+" joined Trollbox!",
      "Hello!"],
      "Person joined:"
    ));
  }
});

socket.on('user left', data => {
  // Makes sure nickname is a string
  if (typeof data.nick === 'string') {
    send(box(
      // he.decode fixes symbols not displaying
      [he.decode(data.nick)+" left Trollbox.",
      "Goodbye!"],
      "Person left:"
    ));
  }
});

socket.on('user change nick', (old, neue) => {
  // Makes sure nickname is a string
  if (typeof old.nick === 'string' && typeof neue.nick === 'string') {
    send(box(
      // he.decode fixes symbols not displaying
      ["New nickname: "+he.decode(neue.nick),
      "Old nickname "+he.decode(old.nick)],
      "Nickname edited:"
    ));
  }
});

socket.emit("user joined", "Example bot [e?help]", "pink");