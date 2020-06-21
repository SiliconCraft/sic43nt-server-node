# SIC43NT Tag authenticity verification using rolling code

This project provides an example Node.js with Express.js project for SIC43NT rolling code authentication on web application. SIC43NT tag provider can apply this concept to allow SIC43NT tag holders to verify their tags as well as communicate to them regarding to the tag status.

**Table of Content**
* [Basic Concept of SIC43NT](#Basic-Concept-of-SIC43NT)
* [Getting Started](#Getting-Started)
  * [Installing on Microsoft Azure Web App](#Installing-on-Microsoft-Azure-Web-App)  
  * [Installing on Google Cloud Platform](#Installing-on-Google-Cloud-Platform)
* [Usage](##Usage)


## Basic Concept of SIC43NT 

SIC43NT Tag provides 4 distinct NDEF contents coded in Hexadecimal string which can be pass to web service directly. The contents including
1. **UID** or **Unique ID** **:** 7-bytes UID of this Tag (i.e. "39493000012345")
1. **Tamper Flag:** 1-byte content reflect status of tamper pin. 
If tamper pin is connected to the GND, the result is "00". 
Otherwise Tamper Flag will be "AA" by factory setting value. 
1. **Time-Stamp:** 4-bytes randomly increasing value (each step of increasing is 1 to 255). This content always increasing each time the tag has been read.
1. **Rolling Code:** 4-bytes of stream cipher ([Mickey V1](http://www.ecrypt.eu.org/stream/ciphers/mickey/mickey.pdf)) with input from Time-stamp value as IV.

## Getting Started

### Installing on Microsoft Azure Web App

#### Prerequisites

* SIC43NT Tag
* Android NFC Phone with [SIC43NT Writer](https://play.google.com/store/apps/details?id=com.sic.app.sic43nt.writer) App
* [Microsoft Azure Account](https://azure.microsoft.com/) 
* [Azure Command Line / Azure CLI](https://docs.microsoft.com/en-us/cli/azure) from [Azure Cloud Shell](https://docs.microsoft.com/en-us/azure/cloud-shell/overview) in Azure Portal or locally [install](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) on your macOS, Linux or Window machine.

#### Step 1 : Create a resource group

Create a new resource group to contain this new sample web app by using Azure command line.
The following example <your-resource-group-name> is create a new resource group name and <your-server-location> is the location (i.e. "West Europe"). 

```
az group create --name <your-resource-group-name> --location <your-server-location>
```

#### Step 2 : Create a new Free App Service Plan
Create a new Free App Service Plan by using Azure command line. The following example <your-service-plan-name> is create a new Free App service plan name in your resource group from step 1.

```
az appservice plan create --name <your-service-plan-name> --resource-group <your-resource-group-name> --sku FREE
```

#### Step 3 : Create a Web App 
Create a new Web App by using Azure command line. The following example creates a new Web App. Please replace <app_name> with a globally unique application name (valid characters are 'a-z', '0-9', and '-'). 

```
az webapp create --resource-group <your-resource-group-name> --plan <your-service-plan-name> --name <app_name>
```

#### Step 4 : Deploy the sample app using Git
Deploy source code from GitHub to Azure Web App using Azure command line. The following example deploy source code from https://github.com/SiliconCraft/sic43nt-server-node.git in master branch to a Web App name <app_name> in resource group <your-resource-group-name>.

```
az webapp deployment source config --repo-url https://github.com/SiliconCraft/sic43nt-server-node.git --branch master  --name <app_name> --resource-group <your-resource-group-name> --manual-integration
```

#### Step 5 : Customize SIC43NT Tag
Use SIC43NT Writer App on Android NFC Phone to customize SIC43NT Tag as the explanation below.
* RLC MODE Tab (In case of default tag, this RLC mode can leave with default factory value)
  * **Rolling Code Mode**
    * Rolling Code keeps changing.
  * **Rolling Code Key**
    * FFFFFF + Tag UID (i.e. The Key of the Tag with UID = "39493000012345" is "FFFFFF39493000012345".)

* NDEF MESSAGE Tab
  * **MIME:** URL/URI
  * **Prefix:** https://
  * **NDEF Message:** <app_name>.azurewebsites.net/?d=
  * **Dynamic Data**
    * **UID:** Checked
    * **Tdata:** Checked
    * **Rolling Code:** Checked

After completely customize SIC43NT Tag with the setting above, each time you tap the SIC43NT tag to NFC Phone (iPhone, Android or any NDEF support device), the web page will display a table of Tamper Flag, Time Stamp value and Rolling Code value which keep changing. Especially for the rolling code value, it will be a match between "From Tag" and "From Server" column. This mean that server-side application (which calculate rolling code based on same Rolling Code Key) can check the authenticity of SIC43NT Tag.

### Installing on Google Cloud Platform

#### Prerequisites

* SIC43NT Tag
* Android NFC Phone with [SIC43NT Writer](https://play.google.com/store/apps/details?id=com.sic.app.sic43nt.writer) App
* [Google Cloud Console Account](https://console.cloud.google.com/) 
* Google Cloud App Engine

#### Step 1 : Creating and managing projects
 
Google Cloud projects form the basis for creating and using all Google Cloud services. 
To create and manage Google Cloud project using Google Cloud Console, please follow the step in [Creating and managing projects](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project)

#### Step 2 : Creating App Engine 

1. Click "Go to the App Engine dashboard" as the picture below.
![alt text](https://drive.google.com/file/d/162V8FyL1kdB1iJAd83CozJOuUnDx5aLP/view?usp=sharing)

1. select your project name on top left corner.
1. click Activate Cloud Shell on top right corner to use browser shell command. The terminal Google Cloud Shell will be shown as the picture below.
![alt text](https://drive.google.com/file/d/1xjx3INVnODdfwFSvdWd62AOsGZkki6Ud/view?usp=sharing)

1. update all component and continue update press "Y" (Optional)

```
sudo apt-get update && sudo apt-get --only-upgrade install google-cloud-sdk-bigtable-emulator google-cloud-sdk-datastore-emulator google-cloud-sdk-cbt google-cloud-sdk-pubsub-emulator google-cloud-sdk-app-engine-python-extras google-cloud-sdk-minikube google-cloud-sdk-app-engine-python kubectl google-cloud-sdk-kpt google-cloud-sdk google-cloud-sdk-app-engine-go google-cloud-sdk-firestore-emulator google-cloud-sdk-app-engine-grpc google-cloud-sdk-cloud-build-local google-cloud-sdk-datalab google-cloud-sdk-anthos-auth google-cloud-sdk-kind google-cloud-sdk-spanner-emulator google-cloud-sdk-skaffold google-cloud-sdk-app-engine-java
```

#### Step 3 : Clone the git sample app using Google Cloud Shell

1. Clone source code from GitHub to Google Cloud Platform using Google Cloud Shell. The following example deploy source code from the master branch of https://github.com/SiliconCraft/sic43nt-server-node.git

```
git clone https://github.com/SiliconCraft/sic43nt-server-node.git
```

1. Move the directory into the project folder

```
cd sic43nt-server-node
```

1. Install dependencies for the project:

```
npm install
```

1. vim to change port 3000 to 8080 in app.js file:

```
vim app.js
```

1. Start the HTTP server:

```
npm start
```

1. view the app in your cloud shell toolbar, click "Web preview" and select "Preview on port 8080.".

#### Step 4 : Deploy and run

Deploy app on App Engine by the following command

```
gclond app deploy
```

view the live app

```
gcloud app browse
```

For more information, please find [Quickstart for Node.js](https://cloud.google.com/appengine/docs/standard/nodejs/quickstart#cloud-shell_1)

## Usage

For a general use-case of authenticity verification with SIC43NT, the consistence of rolling code and the increasing of time-stamp value must be verified.

### 1: Verify consistence of rolling code

To verify consistence of rolling code, you can copy class **KeyStream**. These classes are utility for rolling code calculation. 

The method *keystream* of KeyStream calculate rolling code. It requires *80 bits-Key* (input as a 20-characters hexadecimal string) and *32 bits Time Stamp* or *32 bits iv* (input as a 8-characters hexadecimal string).

### 2: Verify increasing of time-stamp value

To verify increasing of time-stamp value, you need data storage to keep latest time-stamp value of each tag (each UID). Please note that this repository does not provide the example to store latest time-stamp in server at the moment. However the logic is quite simple, any web page request with time-stamp value less or equal the latest successful rolling code verification time-stamp value should be consider as a reuse of URL which should be reject.


## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details

