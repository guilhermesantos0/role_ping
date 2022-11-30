[![CodeFactor](https://www.codefactor.io/repository/github/dumbdemon/ping-timer/badge)](https://www.codefactor.io/repository/github/dumbdemon/ping-timer)

# Ping Timer
A bot that disables role pinging when they are mentioned!<br>
Use ` npm install ` to install necessary modules.<br>
Note: This is not intended to be a full production bot and is solely meant for a single server.<br>

### Invite link base
``` https://discord.com/api/oauth2/authorize?&permissions=268455040&scope=bot%20applications.commands&client_id= ```

## Visual Studio Code
If the folder is opened in [Visual Studio Code IDE](https://code.visualstudio.com/), making a new js file in the [commands folder](https://github.com/dumbdemon/Ping-Timer/tree/main/commands) will automatically generate the starting code. This requires the [Auto Snippet](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.auto-snippet) extension to work.

## Example
* Someone mentions @role1<br>
@role1 will be disabled from being mentioned for 1 hour.

## Commands
Add/Remove/Update via Slash comannds!<br>
` <> ` are required<br>
` [] ` are optional

* ``` /addrole <role> [timeout] ``` Timeout default is 1h<br>
* ``` /removerole <role> ```<br>
* ``` /updaterole <role> [timeout] ```<br>
* ``` /about ```<br>
* ``` /shutdown ```

The timeout must follow <strong>ms</strong> logic.

### Example
* 1m = 1 minute
* 1s = 1 second
* 1h = 1 hour

## Preview
![image](https://user-images.githubusercontent.com/86435735/184459956-4be46897-a82b-4f23-9cef-14e4c518068b.png)
