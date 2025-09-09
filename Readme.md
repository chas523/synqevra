# Deployment ThingsBoard for Docker
Implementation of ThingsBoard on docker containers.
## Setup
### 1. Setting up backend
Navigate to `fpl_thingsboard/backend` folder  
For initial running, you **have to** use command  
`docker compose run --rm -e INSTALL_TB=true -e LOAD_DEMO=true thingsboard-ce`  
or    
`docker compose run --rm -e INSTALL_TB=true -e LOAD_DEMO=false thingsboard-ce`  
if you don't want demo data.  
Run `docker compose up` command and wait till initial configuration is complete  
Check your ip address using `ipconfig` command (Windows)  
In browser go to `{YOUR_IP_ADDRESS}:8088` (ex. `10.0.1.35:8088`) or `localhost:8088` if you are using local machine  
Log in as sysadmin@thingsboard.org and change your password (default: sysadmin)  
You can create or modify other users and their roles. We will use tenant account with Tenant Admin role  
If you loaded demo data, then you can log in as tenant@thingsboard.org and change your password (default: tenant)  
If you didn't load demo data, create new tenant by navigating to Tenants > `+` in top right corner > add name "Tenant" > 
Manage tenant admins > `+` in top right corner > add email "tenant@thingsboard.org" and follow the link to set password  
Go to Dashboard > ThingsBoard IoT Gateways and add new Gateway  (`+` in top right corner)
You don't have to download generated file, just press settings on newly created gateway and copy `Access Token`

### 2. Setting up medplum
Make sure that docker is running. Navigate to `http://localhost:3001/` in your browser.  
Log in as admin. Default credentials are:
- Email: `admin@example.com`
- Password: `medplum_admin`  

You can then create new user here: `http://localhost:3001/User/new`

### 3. Setting up gateway
Navigate to `fpl_thingsboard/gateway` folder  
Edit `.env` file and change `GATEWAY_ACCESSTOKEN_ENV` variable to the value copied before in backend (`Access Token`)  
Run `docker compose up` command and wait till initial configuration is complete  
Gateway should change status from Inactive to Active  
Click on created gateway > General Configuration > Logs and enable Remote logs with log level `DEBUG`  
Go back and click on Connectors configuration and add new connector (ex. Type: MQTT, Name:MQTT, Logging level `DEBUG`)  
Use Advanced configuration for created connector, go to General section and enable remote logging (make sure to set same log level as in General Configuration)  
Now go to Configuration section and copy content of `fpl_thingsboard/gateway/default-connector-config.json` file and paste it here  

### 4. Scripts to test configuration
Navigate to `fpl_thingsboard/scripts` folder  
If you want to use: 
1. MQTT  
Edit `mqtt.sh` file and change `AC_TOKEN` to Access Token to your device (`Access Token`)  
Change `MESSAGE` to modify message that will be sent to the device
2. COAP  
Edit `coap.sh` file and change `COAP_TOKEN` to Access Token to your device (`Access Token`)  
Modify `coap-data.json` file and change data to send to device
3. HTTP  
Edit `http.sh` file and change `HTTP_TOKEN` to Access Token to your device (`Access Token`)  
Change `HTTP_MESSAGE` to modify message that will be sent to the device
4. LWM2M  
Check `fpl_thingsboard/scripts/lwm2m-registry/Readme.md` and configure ThingsBoard backend  
Edit `lwm2m.sh` file and change `lwm2m-client` to your unique `Endpoint Client Name` that you just created  

Run `docker compose up --build` command and wait till initial configuration is complete  
Open CMD or Terminal and using `docker exec -it tb-client /bin/bash` command go into container  
You can now run any scripts that you configured (ex. `/mqtt.sh`)  
To check if scripts are working you can open browser and go to `{YOUR_IP_ADDRESS}:8088` > Devices > Your Gateway > Latest Telemetry  
To test connector, navigate to Devices > Demo Device > Latest Telemetry and from docker container run `/mqtt_connector.sh` few times to be able to see changes (since prepared MQTT Broker sends random data every second and single use of the script could be missed)