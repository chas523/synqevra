# Deployment ThingsBoard and Medplum
Implementation of ThingsBoard and Medplum on docker containers.

## Setup

### 1. First time local setup
1. To run project locally, you have to run initialization script. Use `init.bat` or `init.ps1` for Windows or `init.sh` for Linux/Mac.  
2. Go to `fpl_thingsboard/backend` folder and run `docker compose up` command and wait untill containers are running  
3. Navigate to root project folder `/fpl_thingsboard` and run `pnpm install` command to install all dependencies  
4. Copy `fpl_thingsboard/apps/api/.env.example` to `fpl_thingsboard/apps/api/.env` file and fill in the values with your own database url, jwt and refresh jwt secrets, and mailer credentials.  
5. Copy `fpl_thingsboard/apps/front/.env.example` to `fpl_thingsboard/apps/front/.env` file.  
6. Run `pnpm dev` command to start dev server for frontend and backend  
7. Check your ip address using `ipconfig` command (Windows).  
8. Frontend app is running on `{YOUR_IP_ADDRESS}:3000` (ex. `10.0.1.35:3000`) or `localhost:3000` if you are using local machine.  
9. To check thingsboard, go to `{YOUR_IP_ADDRESS}:8088` (ex. `10.0.1.35:8088`) or `localhost:8088` if you are using local machine. You can find default SYS_ADMIN credentials in `fpl_thingsboard/apps/api/.env.example` file.  
10. To accept requested users, go to `localhost:3000/dashboard/requestedUsers` and accept them.  

### 2. After first time setup
1. Go to `fpl_thingsboard/backend` folder and run `docker compose up` command and wait untill containers are running
2. Go to `fpl_thingsboard` folder and run `pnpm dev` command to start dev server for frontend and backend  


### 3. Setting up ThingsBoard Gateway - OPTIONAL!
If you're using our prepared Docker setup, you can use instructions for Option A.


#### Option A — Newer ThingsBoard (edit token in UI)
1. Open the ThingsBoard UI (`{YOUR_IP_ADDRESS}:8088`) and navigate to: Gateway → Gateway List → select created gateway → `General Configuration`
2. In `Access Token`, paste the value of `GATEWAY_ACCESSTOKEN_ENV` from the `fpl_thingsboard/backend/gateway/.env` file

#### Option B — Older ThingsBoard (cannot edit token in UI)
1. Navigate to the `fpl_thingsboard/backend/gateway` folder
2. Edit the `.env` file and set: `GATEWAY_ACCESSTOKEN_ENV=<Access Token copied earlier from backend>`

#### Apply changes and run
1. Navigate to the `fpl_thingsboard/backend/gateway` folder
2. Run the Gateway using `docker compose up`
3. Wait until the initial configuration is complete
4. The Gateway status should change from “Inactive” to “Active”
5. If you're having any issues, check if you don't have any residual ThingsBoard Gateway data on your machine. If so, you can delete `tb-gw-config`, `tb-gw-logs` and `tb-gw-extensions` volumes and try again

#### Configure MQTT connector
1. Click on created gateway > General Configuration > Logs and enable Remote logs with log level `DEBUG`  
2. Go back and click on Connectors configuration and add new connector (ex. Type: MQTT, Name: MQTT, Logging level: `DEBUG`)  
3. Use Advanced configuration for created connector, go to General section and enable remote logging (make sure to set same log level as in General Configuration)  
4. Now go to Configuration section and copy content of `fpl_thingsboard/backend/gateway/default-connector-config.json` file and paste it here  