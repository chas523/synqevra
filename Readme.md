# Deployment ThingsBoard and Medplum
Implementation of ThingsBoard and Medplum on docker containers.

## Setup

### 1. Setting up ThingsBoard
1. Navigate to `fpl_thingsboard/backend` folder  
2. For initial run, you **have to** use command  
`docker compose run --rm -e INSTALL_TB=true -e LOAD_DEMO=true thingsboard-ce`  
or    
`docker compose run --rm -e INSTALL_TB=true -e LOAD_DEMO=false thingsboard-ce`  
if you don't want demo data.  
3. Run `docker compose up` command and wait till initial configuration is complete  
4. Check your ip address using `ipconfig` command (Windows). In browser go to `{YOUR_IP_ADDRESS}:8088` (ex. `10.0.1.35:8088`) or `localhost:8088` if you are using local machine  
5. Log in as sysadmin@thingsboard.org and change your password (default: sysadmin)  
Go to `http://localhost:8088/settings/general` and set `Base URL` to `http://localhost:8088`  
6. You can create or modify other users and their roles. We will use tenant account with Tenant Admin role  
If you loaded demo data, then you can log in as tenant@thingsboard.org and change your password (default: tenant)  
If you didn't load demo data, as sysadmin create new tenant by navigating to Tenants → `+` in top right corner → add name "Tenant" > 
Manage tenant admins → `+` in top right corner → add email "tenant@thingsboard.org" and follow the link to set password  
7. Go to: Entities → Gateways → add new Gateway  (`+` in top right corner) > Name: `ThingsBoard IoT Gateway` → Type: `DEFAULT` → click `Create`  
You don't have to download generated file, just go to `General configuration` on created gateway and copy `Access Token`  
> [!IMPORTANT]
> In newer versions of ThingsBoard, you don't have to copy Access Token, we can edit the Access Token of the gateway directly (see step 3).

### 2. Setting up Medplum
1. Make sure that docker is running. Navigate to `http://localhost:3001/` in your browser.  
2. Log in as admin. Default credentials are:
- Email: `admin@example.com`
- Password: `medplum_admin`  

You can then create new user here: `http://localhost:3001/User/new`

### 3. Setting up ThingsBoard Gateway
If you're using our prepared Docker setup, you can use instructions for Option A.

#### Option A — Newer ThingsBoard (edit token in UI)
1. Open the ThingsBoard UI and navigate to: Gateway → Gateway List → select created gateway → `General Configuration`
2. In `Access Token`, paste the value of `GATEWAY_ACCESSTOKEN_ENV` from the `fpl_thingsboard/gateway/.env` file

#### Option B — Older ThingsBoard (cannot edit token in UI)
1. Navigate to the `fpl_thingsboard/gateway` folder
2. Edit the `.env` file and set: `GATEWAY_ACCESSTOKEN_ENV=<Access Token copied earlier from backend>`

#### Apply changes and run
1. Navigate to the `fpl_thingsboard/gateway` folder
2. Run the Gateway using `docker compose up`
3. Wait until the initial configuration is complete
4. The Gateway status should change from “Inactive” to “Active”
5. If you're having any issues, check if you don't have any residual ThingsBoard Gateway data on your machine. If so, you can delete `tb-gw-config`, `tb-gw-logs` and `tb-gw-extensions` volumes and try again

#### Configure MQTT connector
1. Click on created gateway > General Configuration > Logs and enable Remote logs with log level `DEBUG`  
2. Go back and click on Connectors configuration and add new connector (ex. Type: MQTT, Name: MQTT, Logging level: `DEBUG`)  
3. Use Advanced configuration for created connector, go to General section and enable remote logging (make sure to set same log level as in General Configuration)  
4. Now go to Configuration section and copy content of `fpl_thingsboard/gateway/default-connector-config.json` file and paste it here  

### 4. Frontend app
1. Navigate to the `fpl_thingsboard/frontend` folder
2. If you didn't change anything in docker configuration for backend, you don't need to adjust .env, otherwise please make update specific values
3. To run the app for development, just use `npm run dev` command. Remember to use biome to format your code before committing

### ~~5. Scripts to test configuration~~ Deprecated!
**NOTE: This part is deprecated, you can still use it to test your configuration, but it's no longer maintained and is not required for ThingsBoard and Medplum to work. Be wary of potential bugs or not up-to-date information!**

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