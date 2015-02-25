# MasterMind

### Prerequisites
- Install [Node.js](http://nodejs.org/download/)
- Install Grunt with command:
```
npm install -g grunt-cli
```
- Install Bower with command:
```
npm install -g bower
```
- Navigate <project path>/MasterMindNode and run the following command:
```
npm install
```
- Navigate <project path>/PSMasterMind and run the following:
```
npm install
```
then
```
bower install
```

### Launch
To launch the project, run the following command from <project path>/MasterMindNode:
```
node --debug app
```
then run this following from <project path>/PSMasterMind
```
grunt server
```
Note that on Windows this command launches the browser with address of 0.0.0.0:9000 which should be changed to localhost:9000.

### Issues
All issues are tracked in the PointSource [JIRA instance](https://pointsource.atlassian.net/secure/RapidBoard.jspa?projectKey=PSMM).