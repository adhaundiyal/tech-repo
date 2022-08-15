##Installing the app using a Scratch Org
Set up your environment using below steps:

Enable Dev Hub in your Trailhead Playground
Install Salesforce CLI
Install Visual Studio Code
Install the Visual Studio Code Salesforce extensions, including the Lightning Web Components extension
If you haven't already done so, authorize your hub org and provide it with an alias (myhuborg in the command below):

sfdx auth:web:login -d -a myhuborg

##Clone the lwc-recipes repository:

git clone https://github.com/adhaundiyal/tech-repo.git
cd tech-repo

##Create a scratch org and provide it with an alias (techchallenge in the command below):

sfdx force:org:create -s -f config/project-scratch-def.json -a techchallenge

##Push the app to your scratch org:

sfdx force:source:push

##Import sample data:

sfdx force:data:tree:import -p ./data/data-plan.json

##Open the scratch org:

sfdx force:org:open

##In App Launcher, click View All then select the FX Trade if not already default.


