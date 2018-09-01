const tmi = require('tmi.js')
const haikudos = require('haikudos')
const request = require('request');

// Weather key:
let apiKey = 'ee9fdb809d0657659d66fc6326adfce1';

// Valid commands start with:
let commandPrefix = '!'
// Define configuration options:
let opts = {
  identity: {
    username: 'snibROBOT',
    password: 'oauth:' + 'i5bza8yyoki70b27dxuqae6mo02r8y'
  },
  channels: [
    'Snibro'
  ]
}

// These are the commands the bot knows (defined below):
let knownCommands = { echo, haiku, weather }

// Function called when the "echo" command is issued:
function echo (target, context, params) {
  // If there's something to echo:
  if (params.length) {
    // Join the params into a string:
    const msg = params.join(' ')
    // Send it back to the correct place:
    sendMessage(target, context, msg)
  } else { // Nothing to echo
    console.log(`* Nothing to echo`)
  }
}

// Function called when the "haiku" command is issued:
function haiku (target, context) {
  // Generate a new haiku:
  haikudos((newHaiku) => {
    // Split it line-by-line:
    newHaiku.split('\n').forEach((h) => {
    // Send each line separately:
    sendMessage(target, context, h)
    })
  })
}

function weather (target, context, params) {
  var msg;  
  var weatherReport;
  console.log('These are the values associated with params\n\n' + params + '\nend of parameter list.');
  // If we get passed a city give the weather for it:  
  if(params.length) {
    var city;
    city = params[0];
    console.log(`City name is: ${city}`);
    var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;
    // Get weather information:
    request(url, function (err, response, body) {
      if(err) { // If we encounter a problem stop process and throw an error:
          console.log('error:', error);
      } else { // If we were sent a parameter assume its a city name and proceed accordingly:
          let weatherReport = JSON.parse(body);
          console.log(weatherReport);
          //console.log(weatherReport);
          // Format message:
          msg = `Location: ${weatherReport.name} Temperature: ${weatherReport.main.temp}F Humidity: ${weatherReport.main.humidity}% Wind: ${weatherReport.wind.speed}mph` ;
          sendMessage(target, context, msg);
          }
      });
  } else {
    msg = 'For proper usage use !weather (city)';
    sendMessage(target, context, msg);
  }
}

// Helper function to send the correct type of message:
function sendMessage (target, context, message) {
  if (context['message-type'] === 'whisper') {
    client.whisper(target, message)
  } else {
    client.say(target, message)
  }
}

// Create a client with our options:
let client = new tmi.client(opts)

// Register our event handlers (defined below):
client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)
client.on('disconnected', onDisconnectedHandler)

// Connect to Twitch:
client.connect()

// Called every time a message comes in:
function onMessageHandler (target, context, msg, self) {
  if (self) { return } // Ignore messages from the bot

  // This isn't a command since it has no prefix:
  if (msg.substr(0, 1) !== commandPrefix) {
    console.log(`[${target} (${context['message-type']})] ${context.username}: ${msg}`)
    return
  }

  // Split the message into individual words:
  const parse = msg.slice(1).split(' ')
  // The command name is the first (0th) one:
  const commandName = parse[0]
  // The rest (if any) are the parameters:
  const params = parse.splice(1)

  // If the command is known, let's execute it:
  if (commandName in knownCommands) {
    // Retrieve the function by its name:
    const command = knownCommands[commandName]
    // Then call the command with parameters:
    command(target, context, params)
    console.log(`* Executed ${commandName} command for ${context.username}`)
  } else {
    console.log(`* Unknown command ${commandName} from ${context.username}`)
  }
}

// Called every time the bot connects to Twitch chat:
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}

// Called every time the bot disconnects from Twitch:
function onDisconnectedHandler (reason) {
  console.log(`Disconnected: ${reason}`)
  process.exit(1)
}